import { Component, OnInit, Inject } from '@angular/core';
import { selectOpt } from '../interfaces/selectOpt';
import { searchRec } from '../services/searchFaasRec.service';
import { landTaxTable } from '../interfaces/landTaxTable';
import { landTaxInfOwn } from '../interfaces/landTaxInfOwn';
import { landTaxInfAdm } from '../interfaces/landTaxInfAdm';
import { getPosHolders } from '../services/getPosHolders'
import { MatTableDataSource } from '@angular/material';
import { lTaxClearance } from '../classes/lTaxClearance';
import * as _ from 'lodash';
import * as jwt_decode from 'jwt-decode';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { genLandTaxCl } from '../services/genLandTaxCl';
// import docxtemplater from 'docxtemplater';
// import * as JSZip from 'jszip';
// import * as JSZipUtils from 'jszip-utils';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
import { getClFile } from '../services/getClFile.service';
import { Router } from '@angular/router';

var ltTableLs: landTaxTable[] = []
var ltTableInfOwner: landTaxInfOwn[] = []
var ltTableInfAdmin: landTaxInfAdm[] = []

@Component({
  selector: 'app-clearance',
  templateUrl: './clearance.component.html',
  styleUrls: ['./clearance.component.scss']
})
export class ClearanceComponent implements OnInit {


  LTTable = new MatTableDataSource(ltTableLs);
  LTTableInfOwn = new MatTableDataSource(ltTableInfOwner);
  LTTableInfAdm = new MatTableDataSource(ltTableInfAdmin);

  input1: string;
  amount: string;
  CTONo: string;
  dated: string;
  requestor: string;
  purpose: string;
  encoder1: string;
  date: string;
  certfee: string;
  amt: string;
  orNo: string;
  remarks: string;
  posHolders: any;


  lTaxHeader: string[] = [
    'arpNo', 'pin', 'surveyNo', 'lotNo', 'blockNo',
    'streetNo', 'brgy', 'subd', 'city', 'province',
    'class', 'subclass', 'area', 'assessedVal', 'stat'
  ];

  lTaxInfHeaderOwn: string[] = [
    'ownName', 'ownAddress', 'ownContact', 'ownTIN'
  ];

  lTaxInfHeaderAdm: string[] = [
    'admName', 'admAddress', 'admContact', 'admTIN'
  ];

  constructor(private srchRec: searchRec,
    private genCL: genLandTaxCl,
    private route: Router,
    private gPos: getPosHolders,
    public matDialog: MatDialog) { }

  ngOnInit() {
    if(localStorage.getItem('auth')) {
      let obj = jwt_decode(localStorage.getItem('auth'));
      this.encoder1 = obj.name;
      this.gPos.getPosHoldersCl().subscribe(res => {
        this.posHolders = res;
      })
    } else {
      this.route.navigate(['/login']);
    }
  }

  param1: string = 'land';
  param2: string = 'name';
  req: string = 'CHEUNG TIN CHEE';

  params1: selectOpt[] = [
    { value: 'land', viewVal: 'Land' },
    { value: 'building', viewVal: 'Building' },
  ];
  params2: selectOpt[] = [
    { value: 'pin', viewVal: 'PIN' },
    { value: 'arpNo', viewVal: 'ARP No.' },
    { value: 'name', viewVal: 'Name' },
  ];

  prps: selectOpt[] = [
    { value: 's1', viewVal: 'Cancellation/Registration of mortgage contract' },
    { value: 's2', viewVal: 'Transfer of ownership' },
    { value: 's3', viewVal: 'Bank Loan/Pag-ibig Loan' },
    { value: 's4', viewVal: 'Business Permit' },
    { value: 's5', viewVal: 'Others: For whatever legal purpose' },
  ]

  isVisible_spinner = false
  search() {
    this.isVisible_spinner = true;
    ltTableLs = []
    ltTableInfOwner = []
    ltTableInfAdmin = []
    this.LTTable = new MatTableDataSource(ltTableLs);
    this.LTTableInfOwn = new MatTableDataSource(ltTableInfOwner);
    this.LTTableInfAdm = new MatTableDataSource(ltTableInfAdmin);
    let reqdata: any = {
      SearchIn: this.param1,
      SearchBy: this.param2,
      info: this.req,
    }
    this.srchRec.search(reqdata).subscribe(res => {
      let resdata = res.data;
      let faas = resdata.faas;
      let owner = resdata.owner;
      let admin = resdata.admin;
      console.table(resdata);
      _.forEach(faas, arr => {
        ltTableLs.push({
          arpNo: arr.ARPNo,
          pin: arr.PIN,
          surveyNo: arr.SurveyNo,
          lotNo: arr.LotNo,
          blockNo: arr.BlockNo,
          streetNo: arr.StreetNo,
          brgy: arr.Barangay,
          subd: arr.Subdivision,
          city: arr.City,
          province: arr.Province,
          class: arr.Class,
          subclass: arr.SubClass,
          area: arr.Area,
          assessedVal: arr.AssessedValue,
          stat: arr.Status
        });
      });
      _.forEach(owner, arr => {
        _.forEach(arr, arr => {
          ltTableInfOwner.push({
            ownName: arr.first_name + ' ' + arr.middle_name + ' ' + arr.last_name,
            ownAddress: arr.address,
            ownContact: arr.contact,
            ownTIN: arr.TIN
          })
        })
      });
      _.forEach(admin, arr => {
        _.forEach(arr, arr => {
          ltTableInfAdmin.push({
            admName: arr.first_name + ' ' + arr.middle_name + ' ' + arr.last_name,
            admAddress: arr.address,
            admContact: arr.contact,
            admTIN: arr.TIN
          })
        })
      });
      this.LTTable = new MatTableDataSource(ltTableLs);
      this.LTTableInfOwn = new MatTableDataSource(ltTableInfOwner);
      this.LTTableInfAdm = new MatTableDataSource(ltTableInfAdmin);
      this.isVisible_spinner = false;
    });
  }

  genCl() {
    console.log(this.date);
    let data: lTaxClearance = {
      current_date: moment(new Date).format('MM-DD-YYYY'),
      owner_names: this.getOwners(),
      pin: ltTableLs[0].pin,
      arp_no: ltTableLs[0].arpNo,
      location: ltTableLs[0].brgy + ', ' + ltTableLs[0].city + ', ' + ltTableLs[0].province,
      assessed_value: ltTableLs[0].assessedVal,
      payment_reason: this.input1,
      total_amount: this.amount,
      cto_no: this.CTONo,
      dated: moment(this.dated).format('MM/DD/YYYY'),
      name_of_requestor: this.requestor,
      s1: ' ',
      s2: ' ',
      s3: ' ',
      s4: ' ',
      s5: ' ',
      verified_by: this.encoder1,
      by_name1: this.posHolders[0].holder_name,
      by_title1: this.posHolders[0].position_name,
      certification_fee: this.certfee,
      or_no: this.orNo,
      date: moment(this.date).format('MM/DD/YYYY'),
      amount: this.amt,
      by_name2: this.posHolders[1].holder_name,
      by_title2: this.posHolders[1].position_name,
      remarks: this.remarks
    };
    switch(this.purpose) {
      case 's1':
        data.s1 = 'x';
        break;
      case 's2':
        data.s2 = 'x';
        break;
      case 's3':
        data.s3 = 'x';
        break;
      case 's4':
        data.s4 = 'x';
        break;
      case 's5':
        data.s5 = 'x';
        break;
    }
    this.genCL.loadFile(data);
    // JSZipUtils.getBinaryContent('../assets/temp/clearance_template.docx', (err, cont) => {
    //   if (err) { throw err; }
    //   const zip = new JSZip(cont);
    //   const doc = new docxtemplater().loadZip(zip)
    //   doc.setData(data)
    //   try {
    //     doc.render()
    //   } catch (e) {
    //     console.log(JSON.stringify({ error: e }))
    //     throw e;
    //   }
    //   let outFile = doc.getZip().generate({
    //     type: 'base64',
    //     mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    //   });
    //   let fileName = 'LTC_' + data.pin + '_' + new Date().toString();
      // let updData:any = {
      //   'file': outFile,
      //   'filename': fileName
      // }
      // this.upd.uploadCl(updData).subscribe(res => {
      //   (res.res) ? this.matDialog.open(DialogClearance, { width: '80%', height: '90%', data: updData }) : undefined;
      // });
    // });
  }

  getOwners(): string {
    return (ltTableInfOwner.length > 1) ? ltTableInfOwner[0].ownName + ' ET AL' : ltTableInfOwner[0].ownName ;
  }

}

@Component({
  selector: 'app-dialog-clearance',
  templateUrl: 'dialog-clearance.html'
})


export class DialogClearance implements OnInit{

  docxSrc: any;

  constructor(
    public dialogRef: MatDialogRef<DialogClearance>,
    @Inject(MAT_DIALOG_DATA) public genData: any,
    private gC: getClFile
  ) {}

  ngOnInit() {
    // console.log(this.genData)
    let req = {
      file: this.genData.filename + '.pdf'
    }
    this.gC.getFile(req).subscribe(res => {
      console.log(res);
      this.docxSrc = 'data:pdf;base64,' + res.file;
    })
    
    // this.docxSrc = 'http://192.168.100.24:5000/api/get-file/land-tax/' + this.genData.filename + '.pdf';
    // this.docxSrc = 'data:document;base64,' + this.genData
  }

}

@Pipe({ name: 'docxPipe' })
export class DialogClearancePipe implements PipeTransform  {
  constructor(private sanitizer: DomSanitizer) { }
  transform(value: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
