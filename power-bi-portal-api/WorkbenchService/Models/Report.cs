using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class Report
    {
        public Report()
        {
            ReportRole = new HashSet<ReportRole>();
        }

        public int ReportId { get; set; }
        public string ReportName { get; set; }
        public int ReportCategoryId { get; set; }
        public int DisplayOrder { get; set; }
        public string PowerBireportName { get; set; }
        public string SelectedTab { get; set; }
        public string Description { get; set; }

        public virtual ReportCategory ReportCategory { get; set; }
        public virtual ICollection<ReportRole> ReportRole { get; set; }
    }
}
