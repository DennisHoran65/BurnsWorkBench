using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class DisciplineRef
    {
        public int DisciplineId { get; set; }
        public string DisciplineName { get; set; }
        public int? DisplayOrder { get; set; }
        public DateTime? ModDate { get; set; }
    }
}
