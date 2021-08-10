using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class OrganizationRef
    {
        public string OrgId { get; set; }
        public string OrgName { get; set; }
        public DateTime? ModDate { get; set; }
    }
}
