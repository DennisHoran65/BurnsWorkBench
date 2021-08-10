using System;
using System.Collections.Generic;
using System.Text;

namespace WorkbenchService.UIModels
{
    public class ReportSearch
    {
        public string ReportName { get; set; }
        public string PowerBIName { get; set; }
        public string CategoryName { get; set; }

        public string RoleList { get; set; }

        public string SortField { get; set; }
    }
}
