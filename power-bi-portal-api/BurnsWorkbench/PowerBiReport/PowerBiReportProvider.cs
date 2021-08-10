//using System;
//using System.Collections.Generic;
//using System.Threading.Tasks;

//namespace power_bi_portal_api.PowerBiReport
//{
//    public class PowerBiReportProvider
//    {
//        public PowerBiReportProvider()
//        {
//        }

//        private static async Task<ReportInformation> GetReportInfo(string reportName)
//        {
//            string GroupId = "962f5226-6d41-46e1-a8f6-929c95ccdee8";
//            string DatasetId = "36328fc1-1a63-43a1-91aa-1550b58db5d8"; // per report

//            var myReport = GetReport(reportName);

//            Guid reportId = myReport.ReportGuid;

//            // Authenicates for the client with their user and password
//            var client = await CreatePowerBIClientAsync();

//            // Get the datasets in the group -- not sure if they will need this, the other client uses it for roles
//            var datasets = await client.Datasets.GetDatasetByIdInGroupAsync(GroupId, DatasetId);

//            var reportRoles = new Microsoft.PowerBI.Api.V2.Models.EffectiveIdentity("user", new List<string> { DatasetId });

//            // Gets the list of available reports in the workspace
//            var biReportList = client.Reports.GetReportsInGroup(GroupId);

//            //Filters the reports down to the one that was passed in a parameter
//            var biReport = biReportList.Value.Where(_ => _.Name == reportName).FirstOrDefault();

//            // there are other parameters with this in case you want to filter by roles
//            var generateTokenRequestParameters = new Microsoft.PowerBI.Api.V2.Models.GenerateTokenRequest(accessLevel: "view");

//            // Gets the token which is active for 4 hours
//            var tokenResponse = await client.Reports.GenerateTokenInGroupAsync(GroupId, biReport.Id.ToString(), generateTokenRequestParameters);

//            //formats the information to return
//            return new ReportInformation
//            {
//                Report = biReport,
//                ReportGuid = reportId,
//                AccessToken = tokenResponse.Token,
//                BaseDisplayName = reportName
//            };
//        }

//        private static ClientReport GetReport(string reportName)
//        {
//            List<ClientReport> allReports = new List<ClientReport>();
//            allReports.Add(new ClientReport { ReportName = "MultiClient_MultiBrand", ReportGuid = Guid.Parse("318676e8-f2c4-4df4-917a-9f1a353ae5df") });

//            return allReports.Where(_ => _.ReportName.Equals(reportName, StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();
//        }

//        private static async Task<IPowerBIClient> CreatePowerBIClientAsync()
//        {

//            try
//            {
//                //TODO - move this
//                string ApiUrl = "https://api.powerbi.com/";
//                string AuthorityUrl = "https://login.windows.net/common/oauth2/authorize/";
//                string ResourceUrl = "https://analysis.windows.net/powerbi/api";
//                string Username = "App_bi_analytics@ConnectiveRx.com";
//                string Password = "CRXpwrbi200!";
//                string ClientId = "621a95f2-495e-44a6-bd08-5afde5e04262";

//                var credential = new UserPasswordCredential(Username, Password);

//                // Authenticate using created credentials
//                var authenticationContext = new AuthenticationContext(AuthorityUrl);

//                var authenticationResult = await authenticationContext.AcquireTokenAsync(ResourceUrl, ClientId, credential);


//                if (authenticationResult == null)
//                {
//                    throw new Exception("Authentication failed.");
//                }

//                var tokenCredentials = new TokenCredentials(authenticationResult.AccessToken, "Bearer");

//                // Create a Power BI Client object. It will be used to call Power BI APIs.
//                var client = new PowerBIClient(new Uri(ApiUrl), tokenCredentials);

//                return client;
//            }
//            catch (Exception ex)
//            {
//                throw ex;
//            }
//        }

//        class ReportInformation
//        {

//            public Report Report { get; set; }
//            public Guid ReportGuid { get; set; }
//            public string AccessToken { get; set; }
//            public string BaseDisplayName { get; set; }
//        }


//        class ClientReport
//        {
//            public string ReportName { get; set; }
//            public Guid ReportGuid { get; set; }
//        }
//    }
//}
