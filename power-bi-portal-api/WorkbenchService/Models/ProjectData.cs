using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ProjectData
    {
        public string ProjectId { get; set; }
        public DateTime? ReferenceStartDate { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public bool DisplayAllDisciplines { get; set; }
        public DateTime? LastSavedStartDate { get; set; }
    }
}
