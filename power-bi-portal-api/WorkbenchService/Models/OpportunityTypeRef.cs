using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class OpportunityTypeRef
    {
        public string OppTypeId { get; set; }
        public string OppTypeName { get; set; }
        public short Seq { get; set; }
        public DateTime ModDate { get; set; }
    }
}
