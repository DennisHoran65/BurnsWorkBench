using System;
using System.Collections.Generic;
using System.Text;

namespace WorkbenchService.UIModels
{
    public class ReportCategoryUIInfo
    {
        public int ReportCategoryId { get; set; }
        public int DisplayOrder { get; set; }
        public string CategoryName { get; set; }
        public List<ReportUIInfo> Reports { get; set; }
    }

    public class ReportUIInfo
    {
        public int ReportId { get; set; }
        public string ReportName { get; set; }
        public int ReportCategoryId { get; set; }
        public string PowerBIReportName { get; set; }

        public int DisplayOrder { get; set; }
        public string SelectedTab { get; set; }
        public string Description { get; set; }

        public string CategoryName { get; set; }
        public List<int> RoleList { get; set; }
        public string RoleListDescription { get; set; }
    }
}
