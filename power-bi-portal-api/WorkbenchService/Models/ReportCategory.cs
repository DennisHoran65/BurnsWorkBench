using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ReportCategory
    {
        public ReportCategory()
        {
            Report = new HashSet<Report>();
        }

        public int ReportCategoryId { get; set; }
        public string CategoryName { get; set; }
        public int DisplayOrder { get; set; }

        public virtual ICollection<Report> Report { get; set; }
    }
}
