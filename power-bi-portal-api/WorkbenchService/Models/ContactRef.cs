using System;
using System.Collections.Generic;

namespace WorkbenchService.Models
{
    public partial class ContactRef
    {
        public string ContactId { get; set; }
        public string ClientId { get; set; }
        public string Claddress { get; set; }
        public string Vendor { get; set; }
        public string Veaddress { get; set; }
        public string Type { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string Salutation { get; set; }
        public string Suffix { get; set; }
        public string Title { get; set; }
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
        public string CellPhone { get; set; }
        public string HomePhone { get; set; }
        public string Email { get; set; }
        public string MailingAddress { get; set; }
        public string Billing { get; set; }
        public string PrimaryInd { get; set; }
        public string PreferredName { get; set; }
        public DateTime? ModDate { get; set; }
    }
}
