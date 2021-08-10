using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class OpportunityStageRef
    {
        public string OppStageId { get; set; }
        public string OppStageName { get; set; }
        public short Seq { get; set; }
        public DateTime ModDate { get; set; }
        public string Status { get; set; }
    }
}
