export class ReportCategoryListInfo {
    public categoryName: string;
    public reportCategoryId: number;
    public displayOrder: number;
    public reports: ReportDescriptionInfo[];
}

export class ReportDescriptionInfo {
    public reportId: number;
    public reportName: string;
    public reportCategoryId: number;
    public displayOrder: number;
    public powerBIReportName: string;
    public selectedTab: string;
    public description: string;
    public roleList: number[];

}