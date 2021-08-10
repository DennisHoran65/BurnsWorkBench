using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using WorkbenchService.Models;

namespace WorkbenchService.Data
{
    public partial class Burns_PRWContext : DbContext
    {
        public Burns_PRWContext()
        {
        }

        public Burns_PRWContext(DbContextOptions<Burns_PRWContext> options)
            : base(options)
        {

            var  s = options.ContextType;

        }

        public virtual DbSet<ClientRef> ClientRef { get; set; }
        public virtual DbSet<ContactRef> ContactRef { get; set; }
        public virtual DbSet<DisciplineRef> DisciplineRef { get; set; }
        public virtual DbSet<EmployeeRef> EmployeeRef { get; set; }
        public virtual DbSet<LocationGeoRef> LocationGeoRef { get; set; }
        public virtual DbSet<OpportunityRef> OpportunityRef { get; set; }
        public virtual DbSet<OpportunityStageRef> OpportunityStageRef { get; set; }
        public virtual DbSet<OpportunityTypeRef> OpportunityTypeRef { get; set; }
        public virtual DbSet<OrganizationRef> OrganizationRef { get; set; }
        public virtual DbSet<ProfitCenterRef> ProfitCenterRef { get; set; }
        public virtual DbSet<ProjectData> ProjectData { get; set; }
        public virtual DbSet<ProjectDisciplineData> ProjectDisciplineData { get; set; }
        public virtual DbSet<ProjectEmployeeData> ProjectEmployeeData { get; set; }
        public virtual DbSet<ProjectEmployeeScheduleData> ProjectEmployeeScheduleData { get; set; }
        public virtual DbSet<ProjectRef> ProjectRef { get; set; }
        public virtual DbSet<ProjectTypeRef> ProjectTypeRef { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ClientRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("ClientRef", "app");

                entity.Property(e => e.Address1)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address2)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address3)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address4)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Billing)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.City)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.CladdressId).HasColumnName("CLAddressID");

                entity.Property(e => e.ClientId)
                    .IsRequired()
                    .HasColumnName("ClientID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.ClientName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.ClientNo)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ClientType)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.Country)
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.CustType)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Fax)
                    .HasColumnName("FAX")
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.GovernmentAgency)
                    .IsRequired()
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.Phone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.State)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.Zip)
                    .HasColumnName("ZIP")
                    .HasMaxLength(10)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<ContactRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("ContactRef", "app");

                entity.Property(e => e.Address1)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address2)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address3)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address4)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Billing)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.CellPhone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.City)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.Claddress)
                    .HasColumnName("CLAddress")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ClientId)
                    .HasColumnName("ClientID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.ContactId)
                    .IsRequired()
                    .HasColumnName("ContactID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.Country)
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.Email)
                    .HasColumnName("EMail")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Fax)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.FirstName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.HomePhone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.LastName)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.MailingAddress)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.MiddleName)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.Phone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.PreferredName)
                    .HasMaxLength(60)
                    .IsUnicode(false);

                entity.Property(e => e.PrimaryInd)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.Salutation)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.State)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.Suffix)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Title)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Type)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.Veaddress)
                    .HasColumnName("VEAddress")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Vendor)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Zip)
                    .HasColumnName("ZIP")
                    .HasMaxLength(10)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<DisciplineRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("DisciplineRef", "app");

                entity.Property(e => e.DisciplineId)
                    .HasColumnName("DisciplineID")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.DisciplineName)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ModDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<EmployeeRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("EmployeeRef", "app");

                entity.Property(e => e.Address1)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address2)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address3)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.City)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.ConsultantInd)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.Country)
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.Email)
                    .HasColumnName("EMail")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.EmployeeId)
                    .IsRequired()
                    .HasColumnName("EmployeeID")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Fax)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.FirstName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.FullName)
                    .HasMaxLength(8000)
                    .IsUnicode(false);

                entity.Property(e => e.HireDate).HasColumnType("datetime");

                entity.Property(e => e.HomePhone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.HoursPerDay).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.JcovtPct)
                    .HasColumnName("JCOvtPct")
                    .HasColumnType("decimal(19, 4)");

                entity.Property(e => e.JobCostRate).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.JobCostType)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.LastName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.LocationId)
                    .HasColumnName("LocationID")
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.MiddleName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.MobilePhone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.OrgId)
                    .HasColumnName("OrgID")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.PreferredName)
                    .HasMaxLength(60)
                    .IsUnicode(false);

                entity.Property(e => e.ProfitCenterId)
                    .HasColumnName("ProfitCenterID")
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.ProvCostOtpct)
                    .HasColumnName("ProvCostOTPct")
                    .HasColumnType("decimal(19, 4)");

                entity.Property(e => e.ProvCostRate).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.RaiseDate).HasColumnType("datetime");

                entity.Property(e => e.Salutation)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.State)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.Status)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.Suffix)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.SupervisorId)
                    .HasColumnName("SupervisorID")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.TargetRatio).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.Title)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Type)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.UseTotalHrsAsStd)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.WorkPhone)
                    .HasMaxLength(24)
                    .IsUnicode(false);

                entity.Property(e => e.WorkPhoneExt)
                    .HasMaxLength(8)
                    .IsUnicode(false);

                entity.Property(e => e.Zip)
                    .HasColumnName("ZIP")
                    .HasMaxLength(10)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<LocationGeoRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("LocationGeoRef", "app");

                entity.Property(e => e.LocationId)
                    .IsRequired()
                    .HasColumnName("LocationID")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.LocationName)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ModDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<OpportunityRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("OpportunityRef", "app");

                entity.Property(e => e.Address1)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address2)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Address3)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.AllocMethod)
                    .HasMaxLength(1)
                    .IsUnicode(false);

                entity.Property(e => e.City)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.ClientId)
                    .HasColumnName("ClientID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.CloseDate).HasColumnType("datetime");

                entity.Property(e => e.ContactId)
                    .HasColumnName("ContactID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.Country)
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.County)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Description).IsUnicode(false);

                entity.Property(e => e.EstCompletionDate).HasColumnType("datetime");

                entity.Property(e => e.EstConstructionCost).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.EstFees).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.EstStartDate).HasColumnType("datetime");

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.OpenDate).HasColumnType("datetime");

                entity.Property(e => e.OpportunityId)
                    .IsRequired()
                    .HasColumnName("OpportunityID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.OpportunityName)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.OpportunityNumber)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.OpportunityType)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.OrgId)
                    .HasColumnName("OrgID")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.OurRole)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.PrincipalId)
                    .HasColumnName("PrincipalID")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ProjMgrId)
                    .HasColumnName("ProjMgrID")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectNumber)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.PrproposalWbs1)
                    .HasColumnName("PRProposalWBS1")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.Revenue).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.Stage)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.State)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.SupervisorId)
                    .HasColumnName("SupervisorID")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.WeightedRevenue).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.Zip)
                    .HasMaxLength(10)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<OpportunityStageRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("OpportunityStageRef", "app");

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.OppStageId)
                    .IsRequired()
                    .HasColumnName("OppStageID")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.OppStageName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<OpportunityTypeRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("OpportunityTypeRef", "app");

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.OppTypeId)
                    .IsRequired()
                    .HasColumnName("OppTypeID")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.OppTypeName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<OrganizationRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("OrganizationRef", "app");

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.OrgId)
                    .IsRequired()
                    .HasColumnName("OrgID")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.OrgName)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<ProfitCenterRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("ProfitCenterRef", "app");

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.ProfitCenterId)
                    .IsRequired()
                    .HasColumnName("ProfitCenterID")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.ProfitCenterName)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<ProjectData>(entity =>
            {
                entity.HasKey(e => e.ProjectId);

                entity.ToTable("ProjectData", "app");

                entity.Property(e => e.ProjectId)
                    .HasColumnName("ProjectID")
                    .HasMaxLength(37)
                    .IsUnicode(false);

                entity.Property(e => e.ReferenceStartDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ProjectDisciplineData>(entity =>
            {
                entity.HasKey(e => e.ProjectDisciplineId);

                entity.ToTable("ProjectDisciplineData", "app");

                entity.Property(e => e.ProjectDisciplineId).HasColumnName("ProjectDisciplineID");

                entity.Property(e => e.AmtDollar).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.AmtPercent).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.DisciplineId).HasColumnName("DisciplineID");

                entity.Property(e => e.ProjectId)
                    .IsRequired()
                    .HasColumnName("ProjectID")
                    .HasMaxLength(37);
            });

            modelBuilder.Entity<ProjectEmployeeData>(entity =>
            {
                entity.HasKey(e => e.ProjectEmployeeId)
                    .HasName("PK_ProjectResourceData");

                entity.ToTable("ProjectEmployeeData", "app");

                entity.Property(e => e.ProjectEmployeeId).HasColumnName("ProjectEmployeeID");

                entity.Property(e => e.DisciplineId).HasColumnName("DisciplineID");

                entity.Property(e => e.EmployeeId)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.ProjectId)
                    .IsRequired()
                    .HasMaxLength(37);

                entity.Property(e => e.StartWeekDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ProjectEmployeeScheduleData>(entity =>
            {
                entity.HasKey(e => e.ProjectEmployeeScheduleId)
                    .HasName("PK_ProjectResourceCustomScheduleData");

                entity.ToTable("ProjectEmployeeScheduleData", "app");

                entity.Property(e => e.ProjectEmployeeScheduleId).HasColumnName("ProjectEmployeeScheduleID");

                entity.Property(e => e.ProjectEmployeeId).HasColumnName("ProjectEmployeeID");

                entity.Property(e => e.WeekEndDate).HasColumnType("datetime");

                entity.Property(e => e.WeekStartDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ProjectRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("ProjectRef", "app");

                entity.Property(e => e.BillingBudgeted).HasColumnType("decimal(20, 4)");

                entity.Property(e => e.BillingClientId)
                    .HasColumnName("BillingClientID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.ClientId)
                    .HasColumnName("ClientID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.Fee).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.LocationId)
                    .HasColumnName("LocationID")
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.Multiplier).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.OpportunityId)
                    .HasColumnName("OpportunityID")
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.Orgid)
                    .HasColumnName("ORGID")
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.ProfitCenterId)
                    .HasColumnName("ProfitCenterID")
                    .HasMaxLength(2)
                    .IsUnicode(false);

                entity.Property(e => e.ProjMgrId)
                    .HasColumnName("ProjMgrID")
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectId)
                    .IsRequired()
                    .HasColumnName("ProjectID")
                    .HasMaxLength(37)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectLongName)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectName)
                    .HasMaxLength(40)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectNumber)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectTask)
                    .HasMaxLength(7)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectTypeId)
                    .HasColumnName("ProjectTypeID")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.ReimbAllow).HasColumnType("decimal(19, 4)");

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.Property(e => e.LastSavedStartDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ProjectTypeRef>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("ProjectTypeRef", "app");

                entity.Property(e => e.ModDate).HasColumnType("datetime");

                entity.Property(e => e.ProjectTypeId)
                    .IsRequired()
                    .HasColumnName("ProjectTypeID")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.ProjectTypeName)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
