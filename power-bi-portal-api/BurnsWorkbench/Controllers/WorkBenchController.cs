using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using WorkbenchService;
using WorkbenchService.Data;
using WorkbenchService.Models;
using WorkbenchService.UIModels;

namespace power_bi_portal_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkBenchController : ControllerBase
    {
        Service _service;
        PRWContext _context;


        public WorkBenchController(PRWContext burns_PRWContext)
        {
            _context = burns_PRWContext;
            _service = new Service(_context);
        }

        [HttpGet]
        [Route("disciplines")]
        public List<DisciplineUIModel> GetDisciplines()
        {
            return _service.GetDisciplines();
        }

        [HttpGet]
        [Route("project/{type}/{projectId}")]
        public ProjectUIModel GetProject(string type, string projectId)
        {
            if (type.ToLower() == "project")
            {
                return _service.GetProject(projectId);
            }
            else
            {
                return _service.GetOBE(projectId);
            }
        }
        
        [HttpGet]
        [Route("projectsearchinfo/{type}/{projectMgrId}")]
        public List<ProjectSearchInfo> GetProjectSearchInfo(string type,string projectMgrId)
        {
            if (type.ToLower() == "project")
            {
                return _service.GetProjectSearchInfo(projectMgrId);
            }
            else
            {
                return _service.GetOBESearchInfo(projectMgrId);
            }
        }

        [HttpGet]
        [Route("toplevelprojectlist/{type}")]
        public List<ProjectSearchInfo> GetTopLevelProjectList(string type)
        {
            if (type.ToLower() == "project")
            {
                return _service.GetTopLevelProjectList();
            }
            else
            {
                List <ProjectSearchInfo> returnList=  _service.GetTopLevelOBEList();
                return returnList;
            }
        }


        [HttpGet]
        [Route("employees")]
        public List<EmployeeInfo> GetEmployees()
        {
            return _service.GetEmployees(true); //for all employees get active only.
        }

        [HttpGet]
        [Route("resource/{Id}")]
        public ResourceAllocationInfo GetResource(string Id)
        {
            return _service.GetResourceAllocation(Id);
        }



        [HttpGet]
        [Route("projectmanagers/{projectType}")]
        public List<ProjectManagerInfo> GetProjectManagers(string projectType)
        {
            return _service.GetProjectManagers(projectType);
        }

       

        [HttpPost]
        [Route("save")]
        public bool SaveProject(ProjectUIModel project)
        {
            
            bool result = false;
            try
            {
                if (project.ProjectType.ToLower().Equals("project"))
                {
                    result = _service.SaveProject(project, GetCurrentUser());
                }
                else
                {
                    result = _service.SaveOBE(project, GetCurrentUser());
                }

                CreateLogRecord(project, null);

            }
            catch(Exception ex)
            {
                CreateLogRecord(project, ex);
            }
            return result;
            
        }


        [HttpPost]
        [Route("logMessage")]
        public void LogMessage(LogMessage logMessage)
        {
                CreateLogRecord(logMessage.Message, null);
        }

        [HttpPost]
        [Route("getOtherSchedules/{projectId}")]
        public List<EmployeeOtherSchedule> GetOtherSchedules(string projectId, List<string> employeeIds)
        {
            return _service.GetOtherSchedules(projectId, employeeIds);
        }


        [HttpPost]
        [Route("checkAuthCode")]
        public bool AuthCodeCheck(AuthToken authToken)
        {
            return authToken == null ? false : authToken.Code.Equals("TESTING");
        }

        [HttpPost]
        [Route("permissions")]
        public string[] GetCurrentUserPermissions()
        {
            string[] roles = GetCurrentRoles();
            if (GetCurrentUser() != "Unknown")
            {
                CreateLogRecord(roles, new Exception("No error - Check Roles"));
              //  string[] returnString =  new string[] { "Entry","Admin" };
              //  return returnString;
            }

            string[] permissions = _service.GetUserPermissions(roles);
            return permissions;
        }

        [HttpGet]
        [Route("getTestData")]
        public object GetTestData()
        {
            return _service.GetTestingData();
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
                string[] headerRoles = Request.Headers["groupids"].ToArray();
                foreach (string headerRole in headerRoles)
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
        private void CreateLogRecord(object request, Exception error)
        {

            try
            {
                string requestJson = JsonConvert.SerializeObject(request);
                string exceptionJson = error == null ? "" : JsonConvert.SerializeObject(error);

                string userName = GetCurrentUser();

                var log = new WorkBenchLogData
                {
                    CreateDate = DateTime.UtcNow,
                    Error = exceptionJson,
                    Request = requestJson,
                    UserName = userName
                };

                this._context.WorkBenchLogData.Add(log);
                this._context.SaveChanges();
            }
            catch(Exception ex)
            {
                // errors here should not stop processing, but we should look for another way to log them
                var stop = ex.Message;
            }
        }
    }

    public class AuthToken
    {
        public string Code { get; set; }
    }

    

}