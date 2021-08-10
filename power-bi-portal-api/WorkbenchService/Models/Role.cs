using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class Role
    {
        public Role()
        {
            PermissionRole = new HashSet<PermissionRole>();
            ReportRole = new HashSet<ReportRole>();
        }

        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string AdgroupName { get; set; }
        public string AdgroupId { get; set; }

        public virtual ICollection<PermissionRole> PermissionRole { get; set; }
        public virtual ICollection<ReportRole> ReportRole { get; set; }
    }
}
