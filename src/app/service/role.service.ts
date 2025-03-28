import { Injectable } from '@angular/core';

export interface Role {
  roleName: string;
  createdBy: string;
  createdOn: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  getrolemedium(){
    return Promise.resolve(this.getRolesData().slice(0, 30));
  }
  
  getRolesData(){
    return [
        {
          "roleName": "Manager",
          "createdBy": "Alice Smith",
          "createdOn": "05/10/2022",
          "lastModifiedBy": "Bob Johnson",
          "lastModifiedOn": "08/15/2023",
          "status": "Inactive"
        },
        {
          "roleName": "Supervisor",
          "createdBy": "David Brown",
          "createdOn": "03/22/2021",
          "lastModifiedBy": "Emily White",
          "lastModifiedOn": "06/18/2023",
          "status": "Active"
        },
        {
          "roleName": "Coordinator",
          "createdBy": "James Wilson",
          "createdOn": "09/14/2020",
          "lastModifiedBy": "Sarah Miller",
          "lastModifiedOn": "02/10/2024",
          "status": "Inactive"
        },
        {
          "roleName": "Director",
          "createdBy": "Olivia Harris",
          "createdOn": "07/08/2019",
          "lastModifiedBy": "Michael Scott",
          "lastModifiedOn": "11/30/2023",
          "status": "Active"
        },
        {
          "roleName": "Analyst",
          "createdBy": "Daniel Clark",
          "createdOn": "01/25/2023",
          "lastModifiedBy": "Sophia Martinez",
          "lastModifiedOn": "03/05/2024",
          "status": "Active"
        },

          {
            "roleName": "Manager",
            "createdBy": "Alice Smith",
            "createdOn": "05/10/2022",
            "lastModifiedBy": "Bob Johnson",
            "lastModifiedOn": "08/15/2023",
            "status": "Inactive"
          },
          {
            "roleName": "Supervisor",
            "createdBy": "David Brown",
            "createdOn": "03/22/2021",
            "lastModifiedBy": "Emily White",
            "lastModifiedOn": "06/18/2023",
            "status": "Active"
          },
          {
            "roleName": "Coordinator",
            "createdBy": "James Wilson",
            "createdOn": "09/14/2020",
            "lastModifiedBy": "Sarah Miller",
            "lastModifiedOn": "02/10/2024",
            "status": "Inactive"
          },
          {
            "roleName": "Director",
            "createdBy": "Olivia Harris",
            "createdOn": "07/08/2019",
            "lastModifiedBy": "Michael Scott",
            "lastModifiedOn": "11/30/2023",
            "status": "Active"
          },
          {
            "roleName": "Analyst",
            "createdBy": "Daniel Clark",
            "createdOn": "01/25/2023",
            "lastModifiedBy": "Sophia Martinez",
            "lastModifiedOn": "03/05/2024",
            "status": "Active"
          },
          {
            "roleName": "Manager",
            "createdBy": "Alice Smith",
            "createdOn": "05/10/2022",
            "lastModifiedBy": "Bob Johnson",
            "lastModifiedOn": "08/15/2023",
            "status": "Inactive"
          },
          {
            "roleName": "Supervisor",
            "createdBy": "David Brown",
            "createdOn": "03/22/2021",
            "lastModifiedBy": "Emily White",
            "lastModifiedOn": "06/18/2023",
            "status": "Active"
          },
          {
            "roleName": "Coordinator",
            "createdBy": "James Wilson",
            "createdOn": "09/14/2020",
            "lastModifiedBy": "Sarah Miller",
            "lastModifiedOn": "02/10/2024",
            "status": "Inactive"
          },
          {
            "roleName": "Director",
            "createdBy": "Olivia Harris",
            "createdOn": "07/08/2019",
            "lastModifiedBy": "Michael Scott",
            "lastModifiedOn": "11/30/2023",
            "status": "Active"
          },
          {
            "roleName": "Analyst",
            "createdBy": "Daniel Clark",
            "createdOn": "01/25/2023",
            "lastModifiedBy": "Sophia Martinez",
            "lastModifiedOn": "03/05/2024",
            "status": "Active"
          },
          {
            "roleName": "Manager",
            "createdBy": "Alice Smith",
            "createdOn": "05/10/2022",
            "lastModifiedBy": "Bob Johnson",
            "lastModifiedOn": "08/15/2023",
            "status": "Inactive"
          },
          {
            "roleName": "Supervisor",
            "createdBy": "David Brown",
            "createdOn": "03/22/2021",
            "lastModifiedBy": "Emily White",
            "lastModifiedOn": "06/18/2023",
            "status": "Active"
          },
          {
            "roleName": "Coordinator",
            "createdBy": "James Wilson",
            "createdOn": "09/14/2020",
            "lastModifiedBy": "Sarah Miller",
            "lastModifiedOn": "02/10/2024",
            "status": "Inactive"
          },
          {
            "roleName": "Director",
            "createdBy": "Olivia Harris",
            "createdOn": "07/08/2019",
            "lastModifiedBy": "Michael Scott",
            "lastModifiedOn": "11/30/2023",
            "status": "Active"
          },
          {
            "roleName": "Analyst",
            "createdBy": "Daniel Clark",
            "createdOn": "01/25/2023",
            "lastModifiedBy": "Sophia Martinez",
            "lastModifiedOn": "03/05/2024",
            "status": "Active"
          }     
    ];
  }
}
