using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client;
using Microsoft.PowerBI.Api;
using Microsoft.PowerBI.Api.Models;
using Microsoft.Rest;
using Newtonsoft.Json.Linq;
using WorkbenchService;
using WorkbenchService.Data;
using WorkbenchService.Models;
using WorkbenchService.UIModels;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace power_bi_portal_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PowerBIController : ControllerBase
    {

        Service _service;
        PRWContext _context;

        private readonly IConfiguration _configuration;
        // GET: api/<PowerBIController>
        public PowerBIController(IConfiguration configuration, PRWContext burns_PRWContext)
        {
            _configuration = configuration;
            _context = burns_PRWContext;
            _service = new Service(_context);
        }

        [HttpGet]
        [Route("testString")]
        public string Test()
        {
            return "this is the test string that we want to get back";
        }

        /// <summary>
        /// Gets the configuration 
        /// </summary>
        /// <param name="reportName">Name of the report.  This could be passed in two ways:
        ///                          1) The name of a report in the appsettings (such as Inquiry)
        ///                          2) The name of the report in the PowerBI workspace.  </param>
        /// <returns></returns>
        [HttpGet]
        [Route("pbiToken/{reportName}")]
        public async Task<IActionResult> GetPowerBIEmbedToken(string reportName)
        {
            try
            {
                var accessToken = await GetPowerBIAccessToken(_configuration);
                var tokenCredentials = new TokenCredentials(accessToken, "Bearer");
                using (var client = new PowerBIClient(new Uri(_configuration["PowerBI:ApiUrl"]), tokenCredentials))
                {

                    var workspaceId = GetWorkspaceId();
                    var reportId = GetReportIdFromConfig(reportName);
                    if (reportId == null)
                    {
                        var reportList = client.Reports.GetReports(workspaceId);
                        var rpt = from r in reportList.Value where r.Name == reportName select r;
                        if (rpt.Any())
                        {
                            reportId = rpt.First().Id;
                        }
                        else
                        {
                            CreateReportErrorLog("Report Not found", reportName);
                            throw new Exception("Report not found.");
                        }
                    }

                    //project workbench workspace  2f428352-500c-48d2-a7ee-6abab8e4ba45 is workspace id: inquiry report id is 4afa9049-a910-44e2-bb53-c776bf3206e3
                    //burns engineering workspace d8d68420-22c9-45c0-97a7-7acec7807872 is workspace id: inquiry report id is d9d13e69-130e-4d0e-8793-5eda8da1ccbc
                    var report = await client.Reports.GetReportInGroupAsync(workspaceId, reportId.Value);

                    var generateTokenRequestParameters = new GenerateTokenRequest(accessLevel: "view");
                    var tokenResponse = await client.Reports.GenerateTokenAsync(workspaceId, reportId.Value, generateTokenRequestParameters);

                    return Ok(new { token = tokenResponse.Token, embedUrl = report.EmbedUrl });
                }
            }
            catch (Exception ex)
            {
                string s = ex.Message;
                throw new Exception(ex.Message);
                //return Ok("Nothing");
            }
        }

        [HttpPost]
        [Route("logerror")]
        public void CreateReportErrorLog(string error, string reportName)
        {
            _service.CreateReportErrorLog(error, reportName, GetCurrentUser());
        }

        private string GetCurrentUser()
        {
            return Request.Headers.ContainsKey("UserName")
                    ? Request.Headers["UserName"].First()
                    : "Unknown";
        }

        private string[] GetCurrentRoles()
        {
            try
            {
                List<string> returnRoles = new List<string>();
                //seems front end sometimes concatenates groups into single comma separated value
                //handle this case
                string[] headerRoles= Request.Headers["groupids"].ToArray();
                foreach(string headerRole in headerRoles)
                {
                    returnRoles.AddRange(headerRole.Split(","));
                }

                return returnRoles.ToArray();
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        [Route("reportListforUser")]
        public List<ReportCategoryUIInfo> GetReportListForCurrentUser()
        {
            try
            {
                string[] roles = GetCurrentRoles();
                List<ReportCategoryUIInfo> rcList = _service.GetReportListForUser(roles);
                return rcList;
            }
            catch (Exception ex)
            {
                string msg = ex.Message;
                throw new Exception(msg);
            }
        }

        private Guid GetWorkspaceId()
        {
            string workspace = _configuration["PowerBI:Workspace"];
            return Guid.Parse(workspace);
        }

        private Guid? GetReportIdFromConfig(string reportName)
        {
            string reportguidString = _configuration["PowerBI:Reports:" + reportName];
            if (!String.IsNullOrWhiteSpace(reportguidString))
            {
                return Guid.Parse(reportguidString);
            }
            else
            {
                return null;
            }
        }

        [HttpGet]
        [Route("pbireportlist")]
        /// <summary>
        /// Retrieves the list of reports in the powerbi workspace.
        /// For use in the report admin page
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetPowerBIReportList()
        {
            var accessToken = await GetPowerBIAccessToken(_configuration);
            var tokenCredentials = new TokenCredentials(accessToken, "Bearer");
            using (var client = new PowerBIClient(new Uri(_configuration["PowerBI:ApiUrl"]), tokenCredentials))
            {

                var workspaceId = GetWorkspaceId();
                var reportList = client.Reports.GetReports(workspaceId);
                List<string> nameList = (from r in reportList.Value orderby r.Name select r.Name).ToList();
                return Ok(nameList);    
            }
           
        }

        public static string GetPowerBIAccessTokenForServicePrincipal(IConfiguration _configuration)
        {
            AuthenticationResult authenticationResult = null;
            string[] scope =  new string[] { _configuration["PowerBI:Scope"] };
            string clientId = _configuration["PowerBI:ApplicationId"];
            string clientSecret= _configuration["PowerBI:ApplicationSecret"];
            string authorityURI = _configuration["PowerBI:ServicePrincipalAuthorityUri"]; 
            string tenantId = _configuration["PowerBI:TenantId"];

            // For app only authentication, we need the specific tenant id in the authority url
            var tenantSpecificUrl = authorityURI.Replace("organizations", tenantId);

            // Create a confidential client to authorize the app with the AAD app
            IConfidentialClientApplication clientApp = ConfidentialClientApplicationBuilder
                                                                            .Create(clientId)
                                                                            .WithClientSecret(clientSecret)
                                                                            .WithAuthority(tenantSpecificUrl)
                                                                            .Build();
            // Make a client call if Access token is not available in cache
            authenticationResult = clientApp.AcquireTokenForClient(scope).ExecuteAsync().Result;
            return authenticationResult.AccessToken;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="_configuration"></param>
        /// <returns></returns>
        public static async Task<string> GetPowerBIAccessToken(IConfiguration _configuration)
        {
             string authenticationType = _configuration["PowerBI:AuthenticationType"];
            if (authenticationType.ToLower().Equals("service principal"))
            {
                return GetPowerBIAccessTokenForServicePrincipal(_configuration);
            }

            //This code is left in here in case we want/need to go back to a service account with a password.
            //but this likely won't be called as we are using a service principal.
            try
            {
                using (var client = new HttpClient())
                {
                    var form = new Dictionary<string, string>();
                    form["grant_type"] = "password";
                    form["resource"] = _configuration["PowerBI:ResourceUrl"];
                    form["username"] = _configuration["PowerBI:UserName"];
                    form["password"] = _configuration["PowerBI:Password"];
                    form["client_id"] = _configuration["PowerBI:ApplicationId"];
                    form["client_secret"] = _configuration["PowerBI:ApplicationSecret"];
                    form["scope"] = "openid";
                    client.DefaultRequestHeaders.TryAddWithoutValidation(
                        "Content-Type", "application/x-www-form-urlencoded");
                    using (var formContent = new FormUrlEncodedContent(form))
                    using (var response =
                        await client.PostAsync(_configuration["PowerBI:AuthorityUrl"],
                        formContent))
                    {
                        var body = await response.Content.ReadAsStringAsync();
                        var jsonBody = JObject.Parse(body);
                        var errorToken = jsonBody.SelectToken("error");
                        if (errorToken != null)
                        {
                            throw new Exception(errorToken.Value<string>());
                        }
                        return jsonBody.SelectToken("access_token").Value<string>();
                    }
                }
            }
            catch (Exception ex)
            {
                string message = ex.Message;
                return null;
            }
        }

        /// <summary>
        /// Get the full list of reports for the reports admin page
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("fullreportList")]
        public List<ReportUIInfo> GetFullReportList(ReportSearch searchObject)
        {
            return _service.GetFullReportList(searchObject);

        }
        /// <summary>
        /// Retrieve the list of Report Categories.  For use by the admin pages
        /// for reports and Categories
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("categories")]
        public List<ReportCategoryUIInfo> GetCategories()
        {
            return _service.GetReportCategories();
        }

        /// <summary>
        /// Return a full list of roles from the database, for use by the report admin section.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("roles")]
        public List<Role> GetRoles()
        {
            return _service.GetListOfUserRoles();
        }

        [HttpPost]
        [Route("saveReport")]
        public bool SaveReport(ReportUIInfo report)
        {
            _service.SaveReport(report);
            return true;
        }

        [HttpPost]
        [Route("deleteReport")]
        public bool DeleteReport(ReportUIInfo report)
        {
            _service.DeleteReport(report);
            return true;
        }

        [HttpPost]
        [Route("saveCategory")]
        public bool SaveCategory(ReportCategoryUIInfo category)
        {
            return _service.SaveReportCategory(category);
        }

        [HttpPost]
        [Route("deleteCategory")]
        public bool DeleteCategory(ReportCategoryUIInfo category)
        {
            return _service.DeleteReportCategory(category);
        }

        
        public List<RoleUIModel> GetUserRoles()
        {
            var allRoles = _configuration["Roles"].ToList();
            var selectedRoles = Request.Headers["Groups"];
            List<RoleUIModel> returnRoles = new List<RoleUIModel>();
            return returnRoles;

        }

    }

  


}
