import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ReportCategoryListInfo } from 'src/app/models/report-list-info';
import { AreYouSureComponent } from 'src/app/project-resources/are-you-sure/are-you-sure.component';
import { ReportServiceService } from 'src/app/report-service/report-service.service';

@Component({
  selector: 'app-admin-report-category',
  templateUrl: './admin-report-category.component.html',
  styleUrls: ['./admin-report-category.component.scss']
})
export class AdminReportCategoryComponent implements OnInit {
categories: ReportCategoryListInfo[];
editCategory: ReportCategoryListInfo;
editCategoryId: number;
editCategoryName: string;
editDisplayOrder: number;
newCategoryName: string;

  constructor(private reportService: ReportServiceService,public activeModal: NgbActiveModal, 
        private modalService:NgbModal, private toastr: ToastrService) {

    reportService.reportCategoryList$.subscribe((cl)=>{
      this.categories=cl;
  });

   }

  ngOnInit(): void {
    this.editCategoryId=0;
    this.newCategoryName="";
     this.reportService.getAllReportCategories();
  }

  public setEdit(category: ReportCategoryListInfo)
  {
    this.editCategory=category;
    if (category)
    {
      this.editCategoryId=category.reportCategoryId;
      this.editCategoryName=category.categoryName;
      this.editDisplayOrder=category.displayOrder;
    }
    else
    {
      this.editCategoryId=0;
      this.editCategoryName="";
      this.editDisplayOrder=0;
    }
  }

  public cancelEdit(){
    this.setEdit(null);
  }

  public saveCategory()
  {
    this.editCategory.displayOrder=this.editDisplayOrder;
    this.editCategory.categoryName=this.editCategoryName;
    this.reportService.saveCategory(this.editCategory);
    this.setEdit(null);
  }

  public deleteCategory(category: ReportCategoryListInfo)
  {
    const modalRef = this.modalService.open(AreYouSureComponent, { centered: true});
    modalRef.componentInstance.displayText="you want to permanently remove this category?";
    modalRef.result.then((result)=>{
         if (result==="yes")
         {
          this.reportService.deletCategory(category);
         }

    });

  }
  
  public addCategory()
  {
    if (this.categoryExists())
    {
      this.reportService.toastError("Category already exists", "Cannot Add category");
      return;
    }
    const newDisplayOrder = this.getNewDisplayOrder();
    const newCategory: ReportCategoryListInfo=
    {reportCategoryId: 0,
     categoryName: this.newCategoryName,
     displayOrder: newDisplayOrder,
     reports: []
    };

    this.reportService.saveCategory(newCategory);
    this.setEdit(null);
    this.newCategoryName="";

  }

  private categoryExists() {

    const currCategory=this.categories.find((c)=> {return c.categoryName.toLowerCase()===this.newCategoryName.toLowerCase()});
    if (currCategory)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  private getNewDisplayOrder(): number {
    let maxOrder=1;
    this.categories.forEach((c)=>{
       maxOrder= c.displayOrder>maxOrder ? c.displayOrder : maxOrder;
    });
    return maxOrder + 1;
  }

  closeModal() {
    this.activeModal.close();
  }

}
