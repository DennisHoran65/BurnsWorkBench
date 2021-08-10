using System.Collections.Generic;
using WorkbenchService.Models;

namespace WorkbenchService.UIModels
{
    public class ProjectUIModel
    {
        public ProjectSearchInfo ProjectDetail { get; set; }
        public List<ProjectDisciplineUIModel> ProjectDisciplines { get; set; }

        public List<ProjecEmployeeUIModel> ProjectEmployees { get; set; }
        public string UserName { get; set; }

        /// <summary>
        /// OBE or PROJECT
        /// </summary>
        public string ProjectType { get; set; }

        //

    }
}
