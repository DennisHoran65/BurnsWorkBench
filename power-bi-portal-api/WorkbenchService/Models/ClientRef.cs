using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ClientRef
    {
        public string ClientId { get; set; }
        public string ClientNo { get; set; }
        public string ClientName { get; set; }
        public string ClientType { get; set; }
        public string GovernmentAgency { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Address4 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public string Country { get; set; }
        public string Phone { get; set; }
        public string Fax { get; set; }
        public string Billing { get; set; }
        public Guid? CladdressId { get; set; }
        public string CustType { get; set; }
        public DateTime? ModDate { get; set; }
    }
}
