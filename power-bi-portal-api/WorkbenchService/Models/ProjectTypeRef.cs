using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ProjectTypeRef
    {
        public string ProjectTypeId { get; set; }
        public string ProjectTypeName { get; set; }
        public short Seq { get; set; }
        public DateTime ModDate { get; set; }
    }
}
