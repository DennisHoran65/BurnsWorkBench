using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace WorkbenchService.Models
{
    public class ProjectSearchInfo
    {
        public string ProjectId { get; set; }
        public string ProjectNumber { get; set; }
        public string ProjectMgrId { get; set; }
        public string ProjectTask { get; set; }
        public string ProjectName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Length { get; set; }
        public string ProfitCenter { get; set; }

        public string LocationGeo { get; set; }
        public decimal BillingBudgeted { get; set; }
        public decimal BudgetConsumed { get; set; }

        public decimal BudgetRemaining { get; set; }
        public DateTime? LastSavedStartDate { get; set; }

        public string OrgId { get; set; }
        public string ProfitCenterId { get; set; }
        public string LocationId { get; set; }

        public decimal Multiplier { get; set; }
        public decimal BudgetOverheadRate { get; set; }

        /// <summary>
        /// This is a three part rule:
        /// 1) If the multiplier for the project is greater than zero, the loadedRate
        ///                   =  JobCostRate   x Multiplier
        /// 2) If Multiplier is zero and BudgetOverHeadRate>0, then loadedRate
        ///                   = BudgetOverheadRate  (does not use Employee Job Cost Rate at All)
        /// 3) If Mutliplier is zero and BudgetOverHeadRate is 0 then loadedRate
        ///                   = 
        /// </summary>
        /// <param name="employeeJobCostRate"></param>
        /// <returns></returns>
        public decimal GetEmployeeLoadedRate(EmployeeInfo employee)
        {
           // if (employee.IsGenericResource)
           // {
           //     return employee.JobCostRate;
           // }

            if (Multiplier > 0)
            {
                return Multiplier * employee.JobCostRate;
            }
            if (BudgetOverheadRate > 0)
            {
                return BudgetOverheadRate;
            }
            return employee.JobCostRate * 1.5012m;
        }
    }
}