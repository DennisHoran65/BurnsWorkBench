using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class Permission
    {
        public Permission()
        {
            PermissionRole = new HashSet<PermissionRole>();
        }

        public int PermissionId { get; set; }
        public string PermissionName { get; set; }

        public virtual ICollection<PermissionRole> PermissionRole { get; set; }
    }
}
