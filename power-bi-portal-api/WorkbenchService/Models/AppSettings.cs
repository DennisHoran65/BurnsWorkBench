using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class AppSettings
    {
        public int SettingsId { get; set; }
        public string SettingsName { get; set; }
        public string SettingsDataType { get; set; }
        public string SettingsValue { get; set; }
        public string LastModBy { get; set; }
        public DateTime LastModDate { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
