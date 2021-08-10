using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class PermissionRole
    {
        public int PermissionRoleId { get; set; }
        public int? PermissionId { get; set; }
        public int? RoleId { get; set; }

        public virtual Permission Permission { get; set; }
        public virtual Role Role { get; set; }
    }
}
