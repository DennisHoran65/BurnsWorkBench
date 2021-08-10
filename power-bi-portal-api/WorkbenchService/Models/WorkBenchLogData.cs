using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class WorkBenchLogData
    {
        public long LogId { get; set; }
        public string UserName { get; set; }
        public DateTime CreateDate { get; set; }
        public string Request { get; set; }
        public string Error { get; set; }
    }
}
