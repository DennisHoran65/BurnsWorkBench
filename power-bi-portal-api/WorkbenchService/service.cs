using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WorkbenchService.Data;
using WorkbenchService.Models;
using WorkbenchService.UIModels;

namespace WorkbenchService
{
    public class Service
    {
        PRWContext _context;
        private DateTime satOfLastWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek + -1);
        public Service(PRWContext context = null)
        {


            if (context == null)
            {
                _context = new PRWContext();
            }
            else
            {
                _context = context;
            }
        }
        public List<DisciplineUIModel> GetDisciplines()
        {
            return _context.DisciplineRef
                        .Select(_ => new DisciplineUIModel
                        {
                            DisciplineId = _.DisciplineId,
                            DisciplineName = _.DisciplineName,
                            DisplayOrder = _.DisplayOrder ?? 99
                        })
                        .OrderBy(_ => _.DisplayOrder)
                        .ToList();
        }

        private decimal OverheadRate()
        {
            return 1.5012M;
        }

        public string[] GetUserPermissions(string[] roles)
        {
            var permissions = from p in _context.Permission
                              join pr in _context.PermissionRole
                              on p.PermissionId equals pr.PermissionId
                              join r in _context.Role
                              on pr.RoleId equals r.RoleId
                              where roles.Contains(r.AdgroupId)
                              select p.PermissionName;
            
            string[] returnPermissions = permissions.ToArray();
            return returnPermissions;
        }

        public List<ProjectManagerInfo> GetProjectManagers(string projectType)
        {
            List<string> uniqueProjMgrId;

            if (projectType.ToLower().Equals("obe"))
            {
                uniqueProjMgrId = _context.OpportunityRef
               .Where(_ => _.Status == "A")
               .Select(_ => _.ProjMgrId).Distinct().ToList();
            }
            else
            {
                uniqueProjMgrId = _context.ProjectRef
               .Where(_ => _.Status == "A")
               .Select(_ => _.ProjMgrId).Distinct().ToList();
            }

            return _context.EmployeeRef
                        .Where(_ => uniqueProjMgrId.Contains(_.EmployeeId))
                        .Select(_ => new ProjectManagerInfo
                        {
                            Id = _.EmployeeId,
                            Name = _.FullName != null ? _.FullName.ToUpper() : $"{_.FirstName} {_.LastName}".ToUpper(),
                            FirstName = _.FirstName,
                            LastName = _.LastName
                        })
                        .ToList()
                        .OrderBy(_ => _.LastName)
                        .ToList();

        }
        public ProjectUIModel GetProject(string projectId)
        {
            try
            {
                // to do - need to compose this with all of the sub elements - resources, discplines etc
                var locations = _context.LocationGeoRef.ToList();
                ProjectUIModel model = null;
                var projectList = this.GetProjectSearchInfo(null, projectId);

                if (projectList != null && projectList.Any())
                {
                    model = new ProjectUIModel
                    {
                        ProjectType="PROJECT",
                        ProjectDetail = projectList.First(),
                        ProjectDisciplines = new List<ProjectDisciplineUIModel>()
                    };

                    var discplineList = GetDisciplines();
                    var employeeList = GetEmployees(false); //get active and inactive
                    var projectEmployeeList = _context.ProjectEmployeeData
                        .Where(_ => _.ProjectId == projectId)
                        .ToList();

                    // compose disciplines
                    model.ProjectDisciplines = _context.ProjectDisciplineData.Where(_ => _.ProjectId == projectId)
                        .ToList()
                        .Select(_ => new ProjectDisciplineUIModel
                        {
                            ProjectDisciplineId = _.ProjectDisciplineId,
                            ProjectId = _.ProjectId,
                            DisciplineId = _.DisciplineId,
                            AmtDollar = _.AmtDollar,
                            AmtPercent = _.AmtPercent,
                            DisciplineName = discplineList.FirstOrDefault(d => d.DisciplineId == _.DisciplineId)?.DisciplineName
                        })
                        .ToList();

                    // TODO Refactor this into its own method and add unit tests
                    // add in any historical budget that has already occurred prior to current week

                    /*
                    var alreadySpentSchedules = _context.ProjectEmployeeScheduleData
                                .Where(esd => esd.WeekStartDate < this.satOfLastWeek && projectEmployeeList.Select(pel => pel.ProjectEmployeeId).Contains(esd.ProjectEmployeeId))
                                .ToList();

                    foreach (var discipine in model.ProjectDisciplines)
                    {
                        foreach(ProjectEmployeeScheduleData schedule in alreadySpentSchedules)
                        {
                            var projectEmployee = projectEmployeeList.FirstOrDefault(pel => pel.DisciplineId == discipine.DisciplineId);
                            if (projectEmployee != null)
                            {
                                discipine.HistoricalAllocatedBudget += schedule.Hours * employeeList.Single(e => e.Id == projectEmployee.EmployeeId).Rate;
                                discipine.HistoricalAllocatedHours += schedule.Hours;
                            }
                        }
                        // only count if ALL of the resources schedule is in the past
                        var projectEmployeesForThisDiscipline = _context.ProjectEmployeeData.Where(ped => ped.DisciplineId == discipine.DisciplineId && ped.ProjectId == projectId).Select(ped => ped.ProjectEmployeeId).ToList();
                        var projectEmployeesForThisDiscipline_whereAllSchedulesAreInPast =
                                        _context.ProjectEmployeeScheduleData
                                            .Where(pes => projectEmployeesForThisDiscipline.Contains(pes.ProjectEmployeeId))
                                            .GroupBy(gb => gb.ProjectEmployeeId)
                                            .Select(gb => new { gb.Key, maxDate = gb.Max(x => x.WeekEndDate) })
                                            .Where(result => result.maxDate < satOfLastWeek)
                                            .Count();

                        discipine.HistoricalAllocatedResources = projectEmployeesForThisDiscipline_whereAllSchedulesAreInPast;
                    }
                    */

                    // filter out any employees that have all of their time in the past
                    var today = DateTime.UtcNow;

                    /*
                    var validProjectResources = _context.ProjectEmployeeScheduleData
                                            .Where(esd => esd.WeekEndDate >= today)
                                            .Select(esd => esd.ProjectEmployeeId)
                                            .Distinct();
                   */

                    // compose employees
                    model.ProjectEmployees = projectEmployeeList
                        .Select(_ => new ProjecEmployeeUIModel
                        {
                            EmployeeId = _.EmployeeId,
                            ProjectEmployeeId = _.ProjectEmployeeId,
                            EmployeeSchedule = _context.ProjectEmployeeScheduleData
                                            .Where(cs => cs.ProjectEmployeeId == _.ProjectEmployeeId)
                                            //.Where(esd => esd.WeekEndDate >= today)
                                            .Select(cs => new ProjectEmployeeSchedule
                                            {
                                                ProjectEmployeeId = cs.ProjectEmployeeId,
                                                Hours = cs.Hours,
                                                ProjectEmployeeScheduleId = cs.ProjectEmployeeScheduleId,
                                                WeekEndDate = cs.WeekEndDate,
                                                WeekStartDate = cs.WeekStartDate,
                                                IsCustom = cs.IsCustom
                                            }
                                            ).OrderBy(_ => _.WeekEndDate)
                                            .ToList(),

                            HoursPerWeek = _.HoursPerWeek,
                            StartDate = _.StartWeekDate,
                            StartWeekEndDate=_.StartWeekEndDate,
                            NumberOfWeeks = _.NumberOfWeeks ?? 0,
                            DisciplineId = _.DisciplineId,
                            Discipline = discplineList.Any(d => d.DisciplineId == _.DisciplineId) ? discplineList.FirstOrDefault(d => d.DisciplineId == _.DisciplineId).DisciplineName : "",
                        }).ToList();
                    // compose employee info
                    foreach (var pe in model.ProjectEmployees)
                    {
                        var employee = employeeList.FirstOrDefault(_ => _.Id == pe.EmployeeId);
                        if (employee != null)
                        {
                            pe.LocationGeography = employee.Location;
                            pe.EmployeeName = employee.Name;
                            pe.JobCostRate = employee.JobCostRate;
                            pe.LoadedRate = model.ProjectDetail.GetEmployeeLoadedRate(employee);
                            pe.ProfitCenter = employee.ProfitCenter;
                            pe.AssignedPM = employeeList.Any(e => e.Id == employee.SupervisorId)
                                ? employeeList.FirstOrDefault(e => e.Id == employee.SupervisorId).Name
                                : "";
                        }
                    }

                }
                return model;
            }
            catch (Exception ex)
            {
                var error = ex.Message;
                return null;
            }
        }

        public ProjectUIModel GetOBE(string opportunityId)
        {
            try
            {
                // to do - need to compose this with all of the sub elements - resources, discplines etc
                var locations = _context.LocationGeoRef.ToList();
                ProjectUIModel model = null;
                var projectList = this.GetOBESearchInfo(null, opportunityId);

                if (projectList != null && projectList.Any())
                {
                    model = new ProjectUIModel
                    {
                        ProjectType="OBE",
                        ProjectDetail = projectList.First(),
                        ProjectDisciplines = new List<ProjectDisciplineUIModel>()
                    };

                    var discplineList = GetDisciplines();
                    var employeeList = GetEmployees(false); //get all employees, active and inactive
                    var projectEmployeeList = _context.OpportunityEmployeeData
                        .Where(_ => _.OpportunityId == opportunityId)
                        .ToList();

                    // compose disciplines
                    model.ProjectDisciplines = _context.OpportunityDisciplineData.Where(_ => _.OpportunityId == opportunityId)
                        .ToList()
                        .Select(_ => new ProjectDisciplineUIModel
                        {
                            ProjectDisciplineId = _.OpportunityDisciplineId,
                            ProjectId = _.OpportunityId,
                            DisciplineId = _.DisciplineId,
                            AmtDollar = _.AmtDollar,
                            AmtPercent = _.AmtPercent,
                            DisciplineName = discplineList.FirstOrDefault(d => d.DisciplineId == _.DisciplineId)?.DisciplineName
                        })
                        .ToList();


                    // compose employees
                    model.ProjectEmployees = projectEmployeeList
                        .Select(_ => new ProjecEmployeeUIModel
                        {
                            EmployeeId = _.EmployeeId,
                            ProjectEmployeeId = _.OpportunityEmployeeId,
                            EmployeeSchedule = _context.OpportunityEmployeeScheduleData
                                            .Where(cs => cs.OpportunityEmployeeId == _.OpportunityEmployeeId)
                                            //.Where(esd => esd.WeekEndDate >= today)
                                            .Select(cs => new ProjectEmployeeSchedule
                                            {
                                                ProjectEmployeeId = cs.OpportunityEmployeeId,
                                                Hours = cs.Hours,
                                                ProjectEmployeeScheduleId = cs.OpportunityEmployeeScheduleId,
                                                WeekEndDate = cs.WeekEndDate,
                                                WeekStartDate = cs.WeekStartDate,
                                                IsCustom = cs.IsCustom
                                            }
                                            ).OrderBy(_ => _.WeekEndDate)
                                            .ToList(),

                            HoursPerWeek = _.HoursPerWeek,
                            StartDate = _.StartWeekDate,
                            StartWeekEndDate = _.StartWeekEndDate,
                            NumberOfWeeks = _.NumberOfWeeks ?? 0,
                            DisciplineId = _.DisciplineId,
                            Discipline = discplineList.Any(d => d.DisciplineId == _.DisciplineId) ? discplineList.FirstOrDefault(d => d.DisciplineId == _.DisciplineId).DisciplineName : "",
                        }).ToList();
                    // compose employee info
                    foreach (var pe in model.ProjectEmployees)
                    {
                        var employee = employeeList.FirstOrDefault(_ => _.Id == pe.EmployeeId);
                        if (employee != null)
                        {
                            pe.LocationGeography = employee.Location;
                            pe.EmployeeName = employee.Name;
                            pe.JobCostRate = employee.JobCostRate;
                            pe.LoadedRate = model.ProjectDetail.GetEmployeeLoadedRate(employee);
                            pe.ProfitCenter = employee.ProfitCenter;
                            pe.AssignedPM = employeeList.Any(e => e.Id == employee.SupervisorId)
                                ? employeeList.FirstOrDefault(e => e.Id == employee.SupervisorId).Name
                                : "";
                        }
                    }

                }
                return model;
            }
            catch (Exception ex)
            {
                var error = ex.Message;
                return null;
            }
        }

        /// <summary>
        /// returns Date without hours minutes or seconds.
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        private DateTime DateValue(DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day);
        }

        public bool SaveProject(ProjectUIModel model, string currentUser)
        {
            DateTime updatedDate = DateTime.UtcNow;

            try
            {



                var projectId = model.ProjectDetail.ProjectId;
                var dbProject = _context.ProjectRef.Where(_ => _.ProjectId == projectId).Single();
                //Since we are saving, make LastSavedStartDate the same as the start date
                if (model.ProjectDetail.StartDate.Value!=dbProject.StartDate)
                {
                    dbProject.StartDateUpdatedInApp = true;
                }
                dbProject.StartDate = model.ProjectDetail.StartDate;
                dbProject.LastSavedStartDate = dbProject.StartDate;
                _context.ProjectRef.Update(dbProject);
                _context.SaveChanges();
                // Disciplines
                var currentDisciplines = _context.ProjectDisciplineData.Where(_ => _.ProjectId == projectId).ToList();
                foreach (var disc in model.ProjectDisciplines)
                {
                    if (disc.ProjectDisciplineId != 0)
                    {
                        var discToEdit = _context.ProjectDisciplineData.Single(_ => _.ProjectDisciplineId == disc.ProjectDisciplineId);
                        if (discToEdit.AmtPercent != disc.AmtPercent || discToEdit.AmtDollar != disc.AmtDollar)
                        {
                            discToEdit.AmtPercent = disc.AmtPercent;
                            discToEdit.AmtDollar = disc.AmtDollar;
                            discToEdit.ModifiedBy = currentUser;
                            discToEdit.ModifiedDate = updatedDate;
                        }
                    }
                    else
                    {
                        if (disc.AmtPercent > 0)
                        {
                            _context.ProjectDisciplineData.Add(new ProjectDisciplineData
                            {
                                ProjectId = projectId,
                                DisciplineId = disc.DisciplineId,
                                AmtDollar = disc.AmtDollar,
                                AmtPercent = disc.AmtPercent,
                                CreatedBy = currentUser,
                                CreatedDate = updatedDate,
                                ModifiedBy = currentUser,
                                ModifiedDate = updatedDate
                            });
                        }
                    }
                }
                foreach (var disc in currentDisciplines.Where(_ => !model.ProjectDisciplines.Select(md => md.ProjectDisciplineId).Contains(_.ProjectDisciplineId)))
                {
                    // make sure this is tested
                    disc.AmtDollar = 0;
                    disc.AmtPercent = 0;
                }

                var satOfLastWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek + -1);

                //Resources
                var currentResources = _context.ProjectEmployeeData.Where(_ => _.ProjectId == projectId).ToList();

                var employeesIdsCurrent = currentResources.Select(x => x.ProjectEmployeeId);
                var employeesIdsEdited = model.ProjectEmployees.Select(x => x.ProjectEmployeeId);
                var employeesToDelete = employeesIdsCurrent.Where(_ => !employeesIdsEdited.Contains(_));


                foreach (var employee in model.ProjectEmployees)
                {
                    if (employee.ProjectEmployeeId > 0)
                    {
                        var employeeToEdit = _context.ProjectEmployeeData.Single(_ => _.ProjectEmployeeId == employee.ProjectEmployeeId);
                        employeeToEdit.HoursPerWeek = employee.HoursPerWeek;
                        employeeToEdit.NumberOfWeeks = employee.NumberOfWeeks;
                        employeeToEdit.StartWeekDate = employee.StartDate;
                        employeeToEdit.StartWeekEndDate = employee.StartWeekEndDate;
                        employeeToEdit.DisciplineId = employee.DisciplineId;

                        if (employee.EmployeeSchedule.Any(_ => _.Hours > 0))
                        {
                            var oldRecordsToRemove = _context.ProjectEmployeeScheduleData.Where(_ => _.ProjectEmployeeId == employee.ProjectEmployeeId && _.WeekStartDate > satOfLastWeek);

                            foreach (var employeeSchedule in oldRecordsToRemove)
                            {
                                _context.ProjectEmployeeScheduleData.Attach(employeeSchedule);
                                _context.ProjectEmployeeScheduleData.Remove(employeeSchedule);
                            }
                            foreach (var employeeSchedule in employee.EmployeeSchedule.Where(_ => _.WeekStartDate >= satOfLastWeek))
                            {
                                _context.ProjectEmployeeScheduleData
                                    .Add(new ProjectEmployeeScheduleData
                                    {
                                        Hours = employeeSchedule.Hours,
                                        ProjectEmployeeId = employeeSchedule.ProjectEmployeeId,
                                        WeekEndDate = employeeSchedule.WeekEndDate,
                                        WeekStartDate = employeeSchedule.WeekEndDate.AddDays(-6),
                                        IsCustom = employeeSchedule.IsCustom,
                                        CreatedBy = currentUser,
                                        CreatedDate = updatedDate,
                                        ModifiedBy = currentUser,
                                        ModifiedDate = updatedDate
                                    }
                                );
                            }
                        }
                    }
                    else
                    {
                        _context.ProjectEmployeeData.Add(new ProjectEmployeeData
                        {
                            DisciplineId = employee.DisciplineId,
                            EmployeeId = employee.EmployeeId,
                            HoursPerWeek = employee.HoursPerWeek,
                            NumberOfWeeks = employee.NumberOfWeeks,
                            ProjectId = projectId,
                            StartWeekDate = employee.StartDate,
                            StartWeekEndDate=employee.StartWeekEndDate,
                            CreatedBy = currentUser,
                            CreatedDate = updatedDate,
                            ModifiedBy = currentUser,
                            ModifiedDate = updatedDate
                        });
                    }
                }

                _context.ProjectEmployeeData.RemoveRange(_context.ProjectEmployeeData.Where(_ => employeesToDelete.Contains(_.ProjectEmployeeId)));

                // delete any future schedules for removed employees
                _context.ProjectEmployeeScheduleData
                                        .RemoveRange(_context.ProjectEmployeeScheduleData
                                                        .Where(es =>
                                                            employeesToDelete.Contains(es.ProjectEmployeeId)
                                                            && es.WeekStartDate > satOfLastWeek
                    ));
                _context.SaveChanges();

                // Save any schedules for newly added employees
                foreach (var employee in model.ProjectEmployees.Where(_ => +_.ProjectEmployeeId <= 0))
                {
                    // get new id
                    var projectEmployeeId = _context.ProjectEmployeeData.Single(_ => _.ProjectId == projectId
                                                                                    && _.EmployeeId == employee.EmployeeId
                                                                                    && _.StartWeekDate == employee.StartDate
                                                                                     && _.DisciplineId == employee.DisciplineId).ProjectEmployeeId;

                    foreach (var employeeSchedule in employee.EmployeeSchedule)
                    {
                        _context.ProjectEmployeeScheduleData
                            .Add(new ProjectEmployeeScheduleData
                            {
                                Hours = employeeSchedule.Hours,
                                ProjectEmployeeId = projectEmployeeId,
                                WeekEndDate = employeeSchedule.WeekEndDate,
                                WeekStartDate = employeeSchedule.WeekEndDate.AddDays(-6),
                                IsCustom = employeeSchedule.IsCustom,
                                CreatedBy = currentUser,
                                CreatedDate = updatedDate,
                                ModifiedBy = currentUser,
                                ModifiedDate = updatedDate
                            }
                        );
                    }
                }
                _context.SaveChanges();

                // TODO ADD Try/Catch
                return true;
            }
            catch (Exception ex)
            {
                var err = ex.Message;
                throw ex; // throw it so the api controller catches it and logs it.
            }
        }

        public bool SaveOBE(ProjectUIModel model, string currentUser)
        {
            DateTime updatedDate = DateTime.UtcNow;

            try
            {


                var opportunityId = model.ProjectDetail.ProjectId;
                

               var dbProject = _context.OpportunityRef.Where(_ => _.OpportunityId == opportunityId).Single();
               if (model.ProjectDetail.StartDate.Value != dbProject.EstStartDate.Value)
                {
                    dbProject.EstStartDate = model.ProjectDetail.StartDate;
                    dbProject.StartDateUpdatedInApp = true;
                    _context.OpportunityRef.Update(dbProject);
                    _context.SaveChanges();
                }              

                // Disciplines
                var currentDisciplines = _context.OpportunityDisciplineData.Where(_ => _.OpportunityId == opportunityId).ToList();
                foreach (var disc in model.ProjectDisciplines)
                {
                    if (disc.ProjectDisciplineId != 0)
                    {
                        var discToEdit = _context.OpportunityDisciplineData.Single(_ => _.OpportunityDisciplineId == disc.ProjectDisciplineId);
                        if (discToEdit.AmtPercent != disc.AmtPercent || discToEdit.AmtDollar != disc.AmtDollar)
                        {
                            discToEdit.AmtPercent = disc.AmtPercent;
                            discToEdit.AmtDollar = disc.AmtDollar;
                            discToEdit.ModifiedBy = currentUser;
                            discToEdit.ModifiedDate = updatedDate;
                        }
                    }
                    else
                    {
                        if (disc.AmtPercent > 0)
                        {
                            _context.OpportunityDisciplineData.Add(new OpportunityDisciplineData
                            {
                                OpportunityId = opportunityId,
                                DisciplineId = disc.DisciplineId,
                                AmtDollar = disc.AmtDollar,
                                AmtPercent = disc.AmtPercent,
                                CreatedBy = currentUser,
                                CreatedDate = updatedDate,
                                ModifiedBy = currentUser,
                                ModifiedDate = updatedDate
                            });
                        }
                    }
                }
                foreach (var disc in currentDisciplines.Where(_ => !model.ProjectDisciplines.Select(md => md.ProjectDisciplineId).Contains(_.OpportunityDisciplineId)))
                {
                    // make sure this is tested
                    disc.AmtDollar = 0;
                    disc.AmtPercent = 0;
                }

                var satOfLastWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek + -1);

                //Resources
                var currentResources = _context.OpportunityEmployeeData.Where(_ => _.OpportunityId == opportunityId).ToList();

                var employeesIdsCurrent = currentResources.Select(x => x.OpportunityEmployeeId);
                var employeesIdsEdited = model.ProjectEmployees.Select(x => x.ProjectEmployeeId);
                var employeesToDelete = employeesIdsCurrent.Where(_ => !employeesIdsEdited.Contains(_));


                foreach (var employee in model.ProjectEmployees)
                {
                    if (employee.ProjectEmployeeId > 0)
                    {
                        var employeeToEdit = _context.OpportunityEmployeeData.Single(_ => _.OpportunityEmployeeId == employee.ProjectEmployeeId);
                        employeeToEdit.HoursPerWeek = employee.HoursPerWeek;
                        employeeToEdit.NumberOfWeeks = employee.NumberOfWeeks;
                        employeeToEdit.StartWeekDate = employee.StartDate;
                        employeeToEdit.StartWeekEndDate = employee.StartWeekEndDate;
                        employeeToEdit.DisciplineId = employee.DisciplineId;

                        if (employee.EmployeeSchedule.Any(_ => _.Hours > 0))
                        {
                            var oldRecordsToRemove = _context.OpportunityEmployeeScheduleData.Where(_ => _.OpportunityEmployeeId == employee.ProjectEmployeeId && _.WeekStartDate > satOfLastWeek);

                            foreach (var employeeSchedule in oldRecordsToRemove)
                            {
                                _context.OpportunityEmployeeScheduleData.Attach(employeeSchedule);
                                _context.OpportunityEmployeeScheduleData.Remove(employeeSchedule);
                            }
                            foreach (var employeeSchedule in employee.EmployeeSchedule.Where(_ => _.WeekStartDate >= satOfLastWeek))
                            {
                                _context.OpportunityEmployeeScheduleData
                                    .Add(new OpportunityEmployeeScheduleData
                                    {
                                        Hours = employeeSchedule.Hours,
                                        OpportunityEmployeeId = employeeSchedule.ProjectEmployeeId,
                                        WeekEndDate = employeeSchedule.WeekEndDate,
                                        WeekStartDate = employeeSchedule.WeekEndDate.AddDays(-6),
                                        IsCustom = employeeSchedule.IsCustom,
                                        CreatedBy = currentUser,
                                        CreatedDate = updatedDate,
                                        ModifiedBy = currentUser,
                                        ModifiedDate = updatedDate
                                    }
                                );
                            }
                        }
                    }
                    else
                    {
                        _context.OpportunityEmployeeData.Add(new OpportunityEmployeeData
                        {
                            DisciplineId = employee.DisciplineId,
                            EmployeeId = employee.EmployeeId,
                            HoursPerWeek = employee.HoursPerWeek,
                            NumberOfWeeks = employee.NumberOfWeeks,
                            OpportunityId = opportunityId,
                            StartWeekDate = employee.StartDate,
                            StartWeekEndDate=employee.StartWeekEndDate,
                            CreatedBy = currentUser,
                            CreatedDate = updatedDate,
                            ModifiedBy = currentUser,
                            ModifiedDate = updatedDate
                        });
                    }
                }

                _context.OpportunityEmployeeData.RemoveRange(_context.OpportunityEmployeeData.Where(_ => employeesToDelete.Contains(_.OpportunityEmployeeId)));

                // delete any future schedules for removed employees
                _context.ProjectEmployeeScheduleData
                                        .RemoveRange(_context.ProjectEmployeeScheduleData
                                                        .Where(es =>
                                                            employeesToDelete.Contains(es.ProjectEmployeeId)
                                                            && es.WeekStartDate > satOfLastWeek
                    ));
                _context.SaveChanges();

                // Save any schedules for newly added employees
                foreach (var employee in model.ProjectEmployees.Where(_ => +_.ProjectEmployeeId <= 0))
                {
                    // get new id
                    var opportunityEmployeeId = _context.OpportunityEmployeeData.Single(_ => _.OpportunityId == opportunityId
                                                                                    && _.EmployeeId == employee.EmployeeId
                                                                                    && _.StartWeekDate == employee.StartDate
                                                                                     && _.DisciplineId == employee.DisciplineId).OpportunityEmployeeId;

                    foreach (var employeeSchedule in employee.EmployeeSchedule)
                    {
                        _context.OpportunityEmployeeScheduleData
                            .Add(new OpportunityEmployeeScheduleData
                            {
                                Hours = employeeSchedule.Hours,
                                OpportunityEmployeeId = opportunityEmployeeId,
                                WeekEndDate = employeeSchedule.WeekEndDate,
                                WeekStartDate = employeeSchedule.WeekEndDate.AddDays(-6),
                                IsCustom = employeeSchedule.IsCustom,
                                CreatedBy = currentUser,
                                CreatedDate = updatedDate,
                                ModifiedBy = currentUser,
                                ModifiedDate = updatedDate
                            }
                        );
                    }
                }
                _context.SaveChanges();

                // TODO ADD Try/Catch
                return true;
            }
            catch (Exception ex)
            {
                var err = ex.Message;
                throw ex; // throw it so the api controller catches it and logs it.
            }
        }

        public List<ProjectSearchInfo> GetProjectSearchInfo(string ProjectMgrId = null, string projectId = null)
        {
            if (ProjectMgrId == "null")
            {
                ProjectMgrId = null;
            }

            List<KeyValuePair<string, string>> ProfitCenters = _context.ProfitCenterRef
                                                            .Select(_ => new KeyValuePair<string, string>(_.ProfitCenterId, _.ProfitCenterName))
                                                            .ToList();

            List<KeyValuePair<string, string>> Locations = _context.LocationGeoRef
                                                           .Select(_ => new KeyValuePair<string, string>(_.LocationId, _.LocationName))
                                                           .ToList();
            List<ProjectSearchInfo> returnList= _context.ProjectRef.Where(_ => (_.ProjMgrId == ProjectMgrId || ProjectMgrId == null)
                                                && (_.ProjectId == projectId || projectId == null)
                                                && (_.ProjectTask ?? "") != ""
                                                && (_.Status == "A"))

                .ToList()
                .Select(_ =>
                        new ProjectSearchInfo
                        {
                            ProjectId = _.ProjectId,
                            ProjectMgrId = _.ProjMgrId,
                            ProjectName = _.ProjectName,
                            ProjectNumber = _.ProjectNumber,
                            ProjectTask = (_.ProjectTask ?? "").Replace(" ", "") == "" ? "---" : _.ProjectTask,
                            StartDate = _.StartDate,
                            EndDate = _.EndDate,
                            Length = 0,
                            BillingBudgeted = _.BillingBudgeted ?? 0,
                            BudgetConsumed = _.BudgetConsumed ?? 0,
                            BudgetRemaining = _.BillingBudgeted.GetValueOrDefault(0) - _.BudgetConsumed.GetValueOrDefault(0),
                            ProfitCenterId = _.ProfitCenterId,
                            LocationId = _.LocationId,
                            LastSavedStartDate = _.LastSavedStartDate ?? _.StartDate,
                            Multiplier = _.Multiplier.GetValueOrDefault(0),
                            BudgetOverheadRate=_.BudOhrate.GetValueOrDefault(0)
                        })
                .OrderBy(_ => _.ProjectMgrId).ThenBy(_ => _.ProjectNumber).ThenBy(_ => _.ProjectTask)
                .ToList();

            foreach (ProjectSearchInfo p in returnList)
            {

                if (!String.IsNullOrWhiteSpace(p.ProfitCenterId) &&
                    ProfitCenters.Where((x) => x.Key == p.ProfitCenterId).Any())
                {
                    p.ProfitCenter = ProfitCenters.Where((x) => x.Key == p.ProfitCenterId).Single().Value;
                }
                if (!String.IsNullOrWhiteSpace(p.LocationId) &&
                    Locations.Where((x) => x.Key == p.LocationId).Any())
                {
                   p.LocationGeo = Locations.Where((x) => x.Key == p.LocationId).Single().Value;
                }
            }

            return returnList;
        }

        public List<ProjectSearchInfo> GetOBESearchInfo(string ProjectMgrId = null, string opportunityId = null)
        {
            if (ProjectMgrId == "null")
            {
                ProjectMgrId = null;
            }

            List<KeyValuePair<string, string>> ProfitCenters = _context.ProfitCenterRef
                                                            .Select(_ => new KeyValuePair<string, string>(_.ProfitCenterId, _.ProfitCenterName))
                                                            .ToList();
            List<KeyValuePair<string, string>> Locations = _context.LocationGeoRef
                                                            .Select(_ => new KeyValuePair<string, string>(_.LocationId, _.LocationName))
                                                            .ToList();

            var obeSearchResult = from obe in _context.OpportunityRef
                                  join stg in _context.OpportunityStageRef
                                  on obe.Stage equals stg.OppStageId
                                  where (obe.ProjMgrId == ProjectMgrId || ProjectMgrId == null)
                                   && (obe.OpportunityId == opportunityId || opportunityId == null)
                                   && (obe.ProjectNumber == "" || obe.ProjectNumber == null)
                                   && stg.Status == "A"
                                   && obe.Status =="A"
                                   && obe.OpportunityName.Length > 0
                                  select obe;

            List < ProjectSearchInfo > returnList = 
                obeSearchResult
                .ToList()
                .Select(_ =>
                     new ProjectSearchInfo
                     {
                         ProjectId = _.OpportunityId,
                         ProjectMgrId = _.ProjMgrId,
                         ProjectName = "Task",
                         ProjectNumber = _.OpportunityNumber,
                         ProjectTask = "001",
                         StartDate = _.EstStartDate,
                         EndDate = _.EstCompletionDate,
                         Length = 0,
                         OrgId = _.OrgId,
                         ProfitCenterId=_.ProfitCenterId,
                         LocationId=_.LocationId,
                         BillingBudgeted = _.Revenue ?? 0,
                         BudgetConsumed = 0,
                         BudgetRemaining = _.Revenue ?? 0,
                         //   ProfitCenter=ProfitCenters.Where((x)=> x.Key== _.OrgId.Substring(0, _.OrgId.IndexOf(":"))).Single().Value,
                         //   Location= Locations.Where((x) => x.Key == _.OrgId.Substring(_.OrgId.IndexOf(":")+1)).Single().Value,
                         LastSavedStartDate = _.EstStartDate
                     })
                .OrderBy(_ => _.ProjectMgrId).ThenBy(_ => _.ProjectNumber)
                .ToList();

            foreach(ProjectSearchInfo p in returnList)
            {
                if (!String.IsNullOrWhiteSpace(p.OrgId) && p.OrgId.IndexOf(":")>0)
                {

                    var profitCenterQuery = ProfitCenters.Where((x) => x.Key == p.ProfitCenterId);
                    var locationGeoQuery = Locations.Where((x) => x.Key == p.LocationId);

                    if (profitCenterQuery.Any())
                    {
                        p.ProfitCenter = profitCenterQuery.Single().Value;
                    }
                    else
                    {
                        p.ProfitCenter = String.Empty;
                    }

                    if (locationGeoQuery.Any())
                    {
                        p.LocationGeo = locationGeoQuery.Single().Value;
                    }
                    else
                    {
                        p.LocationGeo = String.Empty;
                    }
                }
            }
            return returnList;

        }

        public List<ProjectSearchInfo> GetTopLevelProjectList()
        {
            return _context.ProjectRef.Where(_ => (_.ProjectTask ?? "") == "" && _.Status == "A")
              .ToList()
              .Select(_ =>
                      new ProjectSearchInfo
                      {
                          ProjectId = _.ProjectId,
                          ProjectMgrId = _.ProjMgrId,
                          ProjectName = _.ProjectName,
                          ProjectNumber = _.ProjectNumber,
                          ProjectTask = (_.ProjectTask ?? "").Replace(" ", "") == "" ? "---" : _.ProjectTask,
                          StartDate = _.StartDate,
                          EndDate = _.EndDate,
                          Length = 0,
                          BillingBudgeted = _.BillingBudgeted ?? 0,
                          LastSavedStartDate = _.LastSavedStartDate ?? _.StartDate
                      })
              .OrderBy(_ => _.ProjectMgrId).ThenBy(_ => _.ProjectNumber).ThenBy(_ => _.ProjectTask)
              .ToList();
        }

        public List<ProjectSearchInfo> GetTopLevelOBEList()
        {

            var obeResult = from o in _context.OpportunityRef
                            join s in _context.OpportunityStageRef
                            on o.Stage equals s.OppStageId
                            where s.Status == "A"
                            && o.Status == "A"
                            && (o.ProjectNumber == "" || o.ProjectNumber == null)
                            select o;

          List < ProjectSearchInfo > results = 
               obeResult
              .ToList()
              .Select(_ =>
                       new ProjectSearchInfo
                       {
                           ProjectId = _.OpportunityId,
                           ProjectMgrId = _.ProjMgrId,
                           ProjectName = _.OpportunityName,
                           ProjectNumber = _.OpportunityNumber,
                           ProjectTask = String.Empty,
                           StartDate = _.EstStartDate,
                           EndDate = _.EstCompletionDate,
                           Length = 0,
                           BillingBudgeted = _.Revenue ?? 0,
                           ProfitCenter = "N/A",
                           LastSavedStartDate = _.EstStartDate
                       })
              .OrderBy(_ => _.ProjectMgrId).ThenBy(_ => _.ProjectNumber).ThenBy(_ => _.ProjectTask)
              .ToList();

            return results;
        }


        public List<EmployeeInfo> GetEmployees(bool activeOnly)
        {

            var employees = _context.EmployeeRef.Where(_=> (_.Status=="A" || activeOnly==false ) )
                .ToList();
            var disciplines = _context.DisciplineRef.ToList();
            var locations = _context.LocationGeoRef.ToList();
            var profitCenters = _context.ProfitCenterRef.ToList();

            string genericEmployeeTypeId = String.Empty;
            var genericEmployeeType = from tp in _context.EmployeeTypeRef
                                      where tp.TypeDescription.ToLower().Equals("generic")
                                      select tp.TypeId;
            if (genericEmployeeType.Any())
            {
                genericEmployeeTypeId = genericEmployeeType.First();
            }

            List < EmployeeInfo > employeeList = employees.Select(_ => new EmployeeInfo
            {
                Id = _.EmployeeId,
                ProfitCenter = profitCenters.Any(pc => pc.ProfitCenterId == _.ProfitCenterId)
                       ? profitCenters.Single(pc => pc.ProfitCenterId == _.ProfitCenterId).ProfitCenterName
                       : "",
                Name = _.FullName,
                FirstName = _.FirstName,
                LastName = _.LastName,
                SupervisorId = _.SupervisorId,
                SupervisorName = employees.Any(e => e.EmployeeId == _.SupervisorId)
                       ? employees.FirstOrDefault(e => e.EmployeeId == _.SupervisorId).LastName
                       : "",
                Location = locations.Any(l => l.LocationId == _.LocationId)
                                   ? locations.FirstOrDefault(l => l.LocationId == _.LocationId).LocationName
                                   : "",
                JobCostRate = _.JobCostRate ?? 0,
                OverheadRate = OverheadRate(),
                DisciplineId = disciplines.Any(d=>d.DisciplineName ==_.Discipline)
                                && _.Type==genericEmployeeTypeId 
                                ? disciplines.FirstOrDefault(d=> d.DisciplineName==_.Discipline).DisciplineId
                                : 0,
                IsGenericResource = _.Type == genericEmployeeTypeId ? true : false
            }).ToList();

            return employeeList;
        }

        public ResourceAllocationInfo GetResourceAllocation(string Id)
        {
            var employee = _context.EmployeeRef.Where(_ => _.EmployeeId == Id).FirstOrDefault();

            if (employee == null)
            {
                return null;
            }

            // todo determine what this data model needs to be
            return new ResourceAllocationInfo();

        }

        public List<EmployeeOtherSchedule> GetOtherSchedules(string projectId, List<string> employeeIds)
        {

            var projectEmployees = _context.ProjectEmployeeData
                    .Where(_ => _.ProjectId != projectId && employeeIds.Contains(_.EmployeeId))
                    .Select(_ => new { projectEmployee_id = _.ProjectEmployeeId, employeeId = _.EmployeeId }).ToList();

            var projectEmployeeIds = projectEmployees.Select(_ => _.projectEmployee_id).ToList();

            return _context.ProjectEmployeeScheduleData.Where(_ => projectEmployeeIds.Contains(_.ProjectEmployeeId))
                .ToList()
                .Select(_ => new EmployeeOtherSchedule
                {
                    employeeId = projectEmployees.Where(pe => pe.projectEmployee_id == _.ProjectEmployeeId).FirstOrDefault().employeeId,
                    hours = _.Hours,
                    weekEnding = _.WeekEndDate
                }
                ).ToList();
        }

        public Object GetTestingData()
        {
            var employees = _context.EmployeeRef.ToList();
            var pEmployees = _context.ProjectEmployeeData.ToList()
                .Select(_ => new
                {
                    ProjectEmployeeId = _.ProjectEmployeeId,
                    employee = employees.Where(e => e.EmployeeId == _.EmployeeId).FirstOrDefault()
                })
                .ToList();

            return _context.ProjectEmployeeScheduleData
            .ToList()
            .Select(_ => (
                firstname: pEmployees.Where(pe => pe.ProjectEmployeeId == _.ProjectEmployeeId).FirstOrDefault().employee.FirstName,
                lastName: pEmployees.Where(pe => pe.ProjectEmployeeId == _.ProjectEmployeeId).FirstOrDefault().employee.LastName,
                hours: _.Hours,
                weekEnding: _.WeekEndDate
            )
            ).ToList();
        }

        public List<ReportCategoryUIInfo> GetReportListForUser(string[] adRoles)
        {
            

            var reportCategoryList = (from rc in _context.ReportCategory
                                      join r in _context.Report
                                      on rc.ReportCategoryId equals r.ReportCategoryId
                                      join rr in _context.ReportRole
                                      on r.ReportId equals rr.ReportId
                                      join dbRole in _context.Role
                                      on rr.RoleId equals dbRole.RoleId
                                      where adRoles.Contains(dbRole.AdgroupId)
                                      orderby rc.DisplayOrder, r.DisplayOrder
                                      select new { Category = rc, Report = r }).ToList();

            List<ReportCategory> reportCategories = (from rc in reportCategoryList
                                                     select rc.Category).Distinct().ToList();

            List<ReportCategoryUIInfo> reportCategoryUI = new List<ReportCategoryUIInfo>();

            foreach (ReportCategory rc in reportCategories)
            {
                ReportCategoryUIInfo rcUI = new ReportCategoryUIInfo
                {
                    ReportCategoryId = rc.ReportCategoryId,
                    CategoryName = rc.CategoryName,
                    DisplayOrder = rc.DisplayOrder
                };


                List<ReportUIInfo> reports = (from r in reportCategoryList
                                              where r.Category.ReportCategoryId == rc.ReportCategoryId
                                              orderby r.Report.DisplayOrder
                                              select new ReportUIInfo
                                              {
                                                  ReportId = r.Report.ReportId,
                                                  ReportCategoryId = r.Report.ReportCategoryId,
                                                  ReportName = r.Report.ReportName,
                                                  PowerBIReportName = r.Report.PowerBireportName,
                                                  Description = r.Report.Description,
                                                  SelectedTab = r.Report.SelectedTab
                                              }).ToList();

                rcUI.Reports = reports;
                reportCategoryUI.Add(rcUI);

            }

            return reportCategoryUI;
        }


        private int getRoleIdForUser(string userName)
        {
            switch (userName.ToLower())
            {
                case "c":  //c suite
                    return 1;
                case "p": // pm users
                    return 2;
                case "i":
                    return 3;
                default:
                    return 2;
            }
        }

        public void CreateReportErrorLog(string error, string reportName, string userName)
        {
            WorkBenchLogData log = new WorkBenchLogData();
            log.UserName = userName;
            log.CreateDate = DateTime.Now;
            log.Request = "error retrieving reports";
            log.Error = String.Concat("Error retrieving report ", reportName, ": ", error);
            _context.WorkBenchLogData.Add(log);
            _context.SaveChanges();
        }

        /// <summary>
        /// Retrieve the full list of reports from the database.
        /// Also get the name of the categories and the list of assigned roles.
        /// For use by the admin page for reports.
        /// </summary>
        /// <returns></returns>
        public List<ReportUIInfo> GetFullReportList(ReportSearch searchObject)
        {
            var rptList = (from rpt in _context.Report
                           join cat in _context.ReportCategory
                           on rpt.ReportCategoryId equals cat.ReportCategoryId
                           where rpt.ReportName.ToLower().Contains(searchObject.ReportName.ToLower())
                           && rpt.PowerBireportName.ToLower().Contains(searchObject.PowerBIName.ToLower())
                           && cat.CategoryName.ToLower().Contains(searchObject.CategoryName.ToLower())
                           select new ReportUIInfo
                           {
                               ReportId = rpt.ReportId,
                               ReportName = rpt.ReportName,
                               Description = rpt.Description,
                               ReportCategoryId = rpt.ReportCategoryId,
                               PowerBIReportName = rpt.PowerBireportName,
                               SelectedTab = rpt.SelectedTab,
                               CategoryName = cat.CategoryName,
                               DisplayOrder = rpt.DisplayOrder
                           }).ToList();

            var rptRoleList = (from rr in _context.ReportRole
                               join r in _context.Role
                               on rr.RoleId equals r.RoleId
                               select new { rr.ReportId, r.RoleId, r.RoleName }).ToList();

            foreach (ReportUIInfo report in rptList)
            {
                report.RoleList = (from rr2 in rptRoleList
                                   where rr2.ReportId == report.ReportId
                                   select rr2.RoleId).ToList();
                string[] roles = (from rr2 in rptRoleList
                                  where rr2.ReportId == report.ReportId
                                  select rr2.RoleName).ToArray();
                report.RoleListDescription = String.Join(',', roles);

            }

            if (!String.IsNullOrWhiteSpace(searchObject.RoleList))
            {
                rptList = rptList.Where(r => r.RoleListDescription.ToLower().Contains(searchObject.RoleList.ToLower())).ToList();
            }

            if (!String.IsNullOrWhiteSpace(searchObject.SortField))
                {
                switch (searchObject.SortField.ToLower())
                {
                    case "reportname":
                        rptList = rptList.OrderBy(r => r.ReportName).ToList();
                        break;
                    case "powerbireportname":
                        rptList = rptList.OrderBy(r => r.PowerBIReportName).ToList();
                        break;
                    case "rolelistdescription":
                        rptList = rptList.OrderBy(r => r.RoleListDescription).ToList();
                        break;
                    case "selectedtab":
                        rptList = rptList.OrderBy(r => r.SelectedTab).ToList();
                        break;
                    case "displayorder":
                        rptList = rptList.OrderBy(r => r.DisplayOrder).ToList();
                        break;
                    case "categoryname":
                        rptList = rptList.OrderBy(r => r.CategoryName).ToList();
                        break;
                    default:
                        rptList = rptList.OrderBy(r => r.ReportName).ToList();
                        break;

                }
            }

            return rptList;

        }

        public List<ReportCategoryUIInfo> GetReportCategories()
        {
            var catList = from cat in _context.ReportCategory
                          orderby cat.DisplayOrder
                          select new ReportCategoryUIInfo
                          {
                              ReportCategoryId = cat.ReportCategoryId,
                              CategoryName = cat.CategoryName,
                              DisplayOrder = cat.DisplayOrder
                          };

            return catList.ToList();
        }

        /// <summary>
        /// Get Full list of roles for the report admin page
        /// </summary>
        /// <returns></returns>
        public List<Role> GetListOfUserRoles()
        {
            var roleList = from r in _context.Role
                           orderby r.RoleName
                           select r;
            return roleList.ToList();
        }

        /// <summary>
        /// Saves a report to the database. Called by the report admin page.
        /// </summary>
        /// <param name="report"></param>
        public void SaveReport(ReportUIInfo report)
        {
            if (report.ReportId > 0)
            {
                Report dbReport = (from r in _context.Report
                                   where r.ReportId == report.ReportId
                                   select r).Single();

                dbReport.Description = report.Description;
                dbReport.ReportCategoryId = report.ReportCategoryId;
                dbReport.ReportName = report.ReportName;
                dbReport.DisplayOrder = report.DisplayOrder;
                dbReport.PowerBireportName = report.PowerBIReportName;
                dbReport.SelectedTab = report.SelectedTab;
                dbReport.ReportCategory = null;
                dbReport.ReportRole = null;
                _context.Report.Update(dbReport);

                var currReportRoles = from rr in _context.ReportRole
                                      where rr.ReportId == report.ReportId
                                      select rr;

                //Delete ReportRoles from database that are not in current list
                foreach (var reportRoleDelete in currReportRoles.Where(_ => !report.RoleList.Select(roleId => roleId).Contains(_.RoleId)))
                {
                    _context.ReportRole.Remove(reportRoleDelete);
                }

                foreach (int roleIdAdd in report.RoleList)
                {
                    var roleExist = from rr in currReportRoles where rr.RoleId == roleIdAdd select rr;
                    if (!roleExist.Any())
                    {
                        ReportRole rrAdd = new ReportRole();
                        rrAdd.ReportId = report.ReportId;
                        rrAdd.RoleId = roleIdAdd;
                        _context.ReportRole.Add(rrAdd);
                    }
                }
                _context.SaveChanges();
            }
            else
            {
                Report dbReport = new Report();

                dbReport.Description = report.Description;
                dbReport.ReportCategoryId = report.ReportCategoryId;
                dbReport.ReportName = report.ReportName;
                dbReport.DisplayOrder = report.DisplayOrder;
                dbReport.PowerBireportName = report.PowerBIReportName;
                dbReport.SelectedTab = report.SelectedTab;
                dbReport.ReportCategory = null;
                dbReport.ReportRole = null;
                _context.Report.Add(dbReport);
                _context.SaveChanges();

                foreach (int roleIdAdd in report.RoleList)
                {
                    ReportRole rr = new ReportRole();
                    rr.RoleId = roleIdAdd;
                    rr.ReportId = dbReport.ReportId;
                    _context.ReportRole.Add(rr);
                }
                _context.SaveChanges();
            }
        }

        public void DeleteReport(ReportUIInfo report)
        {
            var reportRoleList = from rr in _context.ReportRole
                                 where rr.ReportId == report.ReportId
                                 select rr;
            foreach(ReportRole rr in reportRoleList.ToList())
            {
                _context.ReportRole.Remove(rr);
            }

            var reportDelete = (from r in _context.Report
                                where r.ReportId == report.ReportId
                                select r).Single();

            _context.Report.Remove(reportDelete);
            _context.SaveChanges();

        }

        public bool SaveReportCategory(ReportCategoryUIInfo category)
        {
            if (category.ReportCategoryId>0)
            {
                ReportCategory dbCategory = (from cat in _context.ReportCategory
                                             where cat.ReportCategoryId == category.ReportCategoryId
                                             select cat).Single();
                dbCategory.CategoryName = category.CategoryName;
                dbCategory.DisplayOrder = category.DisplayOrder;
                _context.ReportCategory.Update(dbCategory);
                _context.SaveChanges();
                return true;
            }
            else
            {
                ReportCategory dbCategory = new ReportCategory();
                dbCategory.CategoryName = category.CategoryName;
                dbCategory.DisplayOrder = category.DisplayOrder;
                _context.ReportCategory.Add(dbCategory);
                _context.SaveChanges();
                return true;
            }
        }

        public bool DeleteReportCategory(ReportCategoryUIInfo category)
        {
            var catReport = from r in _context.Report
                            where r.ReportCategoryId == category.ReportCategoryId
                            select r;
            if (catReport.Any())
            {
                throw new Exception("category cannot be deleted with existing reports");
            }    
            else
            {
                ReportCategory deleteCat = (from dc in _context.ReportCategory
                                            where dc.ReportCategoryId == category.ReportCategoryId
                                            select dc).Single();
                _context.ReportCategory.Remove(deleteCat);
                _context.SaveChanges();
                return true;
            }

        }


    }
}
