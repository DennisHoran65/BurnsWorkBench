using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class EmployeeRef
    {
        public string EmployeeId { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string FullName { get; set; }
        public string PreferredName { get; set; }
        public string Salutation { get; set; }
        public string Suffix { get; set; }
        public string Title { get; set; }
        public string ConsultantInd { get; set; }
        public string SupervisorId { get; set; }
        public string OrgId { get; set; }
        public string LocationId { get; set; }
        public string ProfitCenterId { get; set; }
        public string WorkPhone { get; set; }
        public string WorkPhoneExt { get; set; }
        public string MobilePhone { get; set; }
        public decimal? JobCostRate { get; set; }
        public string JobCostType { get; set; }
        public decimal? JcovtPct { get; set; }
        public decimal? TargetRatio { get; set; }
        public decimal? HoursPerDay { get; set; }
        public DateTime? HireDate { get; set; }
        public DateTime? RaiseDate { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public short? BillingCategory { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public string Country { get; set; }
        public string HomePhone { get; set; }
        public string Fax { get; set; }
        public string Email { get; set; }
        public decimal? ProvCostRate { get; set; }
        public decimal? ProvCostOtpct { get; set; }
        public string UseTotalHrsAsStd { get; set; }
        public DateTime? ModDate { get; set; }
        public string Discipline { get; set; }
        public string EmploymentType { get; set; }
    }
}
