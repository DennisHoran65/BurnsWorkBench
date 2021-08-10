using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ReportRole
    {
        public int ReportRoleId { get; set; }
        public int ReportId { get; set; }
        public int RoleId { get; set; }

        public virtual Report Report { get; set; }
        public virtual Role Role { get; set; }
    }
}
