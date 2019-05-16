import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { selectOpt } from '../interfaces/selectOpt';
import { landOwner } from '../interfaces/landOwner';
import { adminOwner } from '../interfaces/adminOwner';
import { stripInfo } from '../interfaces/stripInfo';
import { improvementInfo } from '../interfaces/improvementInfo';
import { marketValue } from '../interfaces/marketValue';

var ownerLs: landOwner[] = []
var adminLs: adminOwner[] = []
var stripInf: stripInfo[] = []
var imprInf: improvementInfo[] = []
var mrktVal: marketValue[] = []

@Component({
  selector: 'app-land-reassessment',
  templateUrl: './land-reassessment.component.html',
  styleUrls: ['./land-reassessment.component.sass']
})
export class LandReassessmentComponent implements OnInit {

  ownersLs = new MatTableDataSource(ownerLs)
  adminsLs = new MatTableDataSource(adminLs)
  stripSetInfo = new MatTableDataSource(stripInf)
  impInf = new MatTableDataSource(imprInf)
  marketValue = new MatTableDataSource(mrktVal)

  stripToggleVal = false

  stripToggle() {
    this.stripToggleVal = !this.stripToggleVal
    if (this.stripToggleVal) {
      Object.keys(this.landReassessment.controls['stripSet'].controls).forEach(key => {
        this.landReassessment.controls['stripSet'].controls[key].enable()
      })
    } else {
      Object.keys(this.landReassessment.controls['stripSet'].controls).forEach(key => {
        this.landReassessment.controls['stripSet'].controls[key].disable()
      })
    }
  }

  ownerHeader: string[] = ['name', 'address', 'contact', 'tin', 'actions']
  adminHeader: string[] = ['name', 'address', 'contact', 'tin', 'actions']
  stripHeader: string[] = ['stripno', 'striparea', 'adjustment', 'adbaserate', 'stripmval', 'actions']
  impHeader: string[] = ['kind', 'total', 'unitval', 'baseval', 'actions']
  mValHeader: string[] = ['bmval', 'adjfactor', 'adjperc', 'adjval', 'markval', 'actions']

  trnsLs: selectOpt[] = [
    { value: 'DISCOVERY/NEW DECLARATION', viewVal: 'DISCOVERY/NEW DECLARATION (DC)' },
    { value: 'SUBDIVISION', viewVal: 'SUBDIVISION (SD)' },
    { value: 'CONSOLIDATION', viewVal: 'CONSOLIDATION (CS)' },
    { value: 'PHYSICAL CHANGE', viewVal: 'PHYSICAL CHANGE (PC)' },
    { value: 'DISPUTE IN ASSESSD VALUE', viewVal: 'DISPUTE IN ASSESSD VALUE (DP)' },
    { value: 'TRANSFER', viewVal: 'TRANSFER (TR)' },
    { value: 'SEGREGATION', viewVal: 'SEGREGATION (SG)' },
    { value: 'RECLASSIFICATIO', viewVal: 'RECLASSIFICATION (RC)' },
    { value: 'SPECIAL PROJECT', viewVal: 'SPECIAL PROJECT (SP)' },
  ]

  landClassLs: selectOpt[] = [
    { value: 'COMMERCIAL', viewVal: 'COMMERCIAL' },
    { value: 'INDUSTRIAL', viewVal: 'INDUSTRIAL' },
    { value: 'RESIDENTIAL', viewVal: 'RESIDENTIAL' },
    { value: 'AGRICULTURAL', viewVal: 'AGRICULTURAL' }
  ]

  subClassLs: selectOpt[] = [
    { value: 'C-1', viewVal: 'C-1' },
    { value: 'C-2', viewVal: 'C-2' },
    { value: 'C-3', viewVal: 'C-3' },
    { value: 'C-4', viewVal: 'C-4' }
  ]

  actualUse: selectOpt[] = [
    { value: 'COMMERCIAL', viewVal: 'COMMERCIAL' },
    { value: 'INDUSTRIAL', viewVal: 'INDUSTRIAL' },
    { value: 'RESIDENTIAL', viewVal: 'RESIDENTIAL' },
    { value: 'AGRICULTURAL', viewVal: 'AGRICULTURAL' }
  ]

  status: selectOpt[] = [
    { value: 'TAXABLE', viewVal: 'TAXABLE' },
    { value: 'EXEMPTED', viewVal: 'EXEMPTED' }
  ]

  quarter: selectOpt[] = [
    { value: '1', viewVal: '1' },
    { value: '2', viewVal: '2' },
    { value: '3', viewVal: '3' },
    { value: '4', viewVal: '4' }
  ]

  stripNo: selectOpt[]

  public landReassessment: FormGroup;

  constructor(private router: Router) { }

  ngOnInit() {
    if (!localStorage.getItem('auth')) {
      this.router.navigate(['/login'])
    }
    this.initializeForm();
  }

  save(form: object) {
    if (this.landReassessment.valid) {
      console.log(form)
    }
  }

  setStripNumSel() {
    this.stripNo = []
    let cnt = +this.landReassessment.controls['stripSet'].controls['stripCount'].value
    for (let i = 1; i <= cnt; i++) {
      this.stripNo.push({ value: i.toString(), viewVal: i.toString() })
    }
  }

  addOwner() {
    let ownerData = this.landReassessment.get('ownerDetails').value
    ownerLs.push({
      ownName: ownerData.ownfName + ' ' + ownerData.ownmName + ' ' + ownerData.ownlName,
      ownAddress: ownerData.ownaddress,
      ownContact: ownerData.owncontact,
      ownTIN: ownerData.ownTIN
    })
    this.ownersLs = new MatTableDataSource(ownerLs)
    Object.keys(this.landReassessment.controls['ownerDetails'].controls).forEach(key => {
      this.landReassessment.controls['ownerDetails'].controls[key].reset()
    })
  }

  addAdmin() {
    let adminData = this.landReassessment.get('adminOwnerLs').value
    adminLs.push({
      admName: adminData.admfName + ' ' + adminData.admmName + ' ' + adminData.admlName,
      admAddress: adminData.admaddress,
      admContact: adminData.admcontact,
      admTIN: adminData.admTIN
    })
    this.adminsLs = new MatTableDataSource(adminLs)
    Object.keys(this.landReassessment.controls['adminOwnerLs'].controls).forEach(key => {
      this.landReassessment.controls['adminOwnerLs'].controls[key].reset()
    })
  }

  addStrip() {
    let stripData = this.landReassessment.get('stripSet').value
    stripInf.push({
      stripNum: stripData.stripNo,
      stripArea: stripData.stripArea,
      adjustment: stripData.adjustment,
      adjustedBaseRate: '',
      stripMarkVal: ''
    })
    this.stripSetInfo = new MatTableDataSource(stripInf)
    Object.keys(this.landReassessment.controls['stripSet'].controls).forEach(key => {
      if (key != 'stripCount') {
        this.landReassessment.controls['stripSet'].controls[key].reset()
      }
    })
  }

  addImp() {
    let impData = this.landReassessment.get('otherImprovements').value
    imprInf.push({
      kind: impData.kind,
      totalNo: impData.totalNo,
      unitVal: impData.unitVal,
      baseMarkVal: impData.basicMarketVal
    })
    this.impInf = new MatTableDataSource(imprInf)
    Object.keys(this.landReassessment.controls['otherImprovements'].controls).forEach(key => {
      this.landReassessment.controls['otherImprovements'].controls[key].reset()
    })
  }

  addMVal() {
    let mValue = this.landReassessment.get('marketVal').value
    mrktVal.push({
      mBaseVal: '',
      mAdjustFactor: '',
      mAdjustPercentage: '',
      mAdjustValue: '',
      mMarketVal: ''
    })
    this.marketValue = new MatTableDataSource(mrktVal)
    Object.keys(this.landReassessment.controls['marketVal'].controls).forEach(key => {
      this.landReassessment.controls['marketVal'].controls[key].reset()
    })
  }

  removeOwnerDetail(evt: any) {
    _.remove(ownerLs, evt)
    this.ownersLs = new MatTableDataSource(ownerLs)
  }

  removeAdminDetail(evt: any) {
    _.remove(adminLs, evt)
    this.adminsLs = new MatTableDataSource(adminLs)
  }

  removeStripDetail(evt: any) {
    _.remove(stripInf, evt)
    this.stripSetInfo = new MatTableDataSource(stripInf)
  }

  removeImp(evt: any) {
    _.remove(imprInf, evt)
    this.impInf = new MatTableDataSource(imprInf)
  }

  removeMVal(evt: any) {
    _.remove(mrktVal, evt)
    this.marketValue = new MatTableDataSource(mrktVal)
  }


  initializeForm() {
    this.landReassessment = new FormGroup({
      trnsCode: new FormControl('', [Validators.required]),
      arpNo: new FormControl('', [Validators.required]),
      pin: new FormGroup({
        city: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required]),
        barangay: new FormControl('', [Validators.required]),
        section: new FormControl('', [Validators.required]),
        parcel: new FormControl('', [Validators.required])
      }),
      OCT_TCT: new FormControl('', [Validators.required]),
      surveyNo: new FormControl('', [Validators.required]),
      lotNo: new FormControl('', [Validators.required]),
      blockNo: new FormControl('', [Validators.required]),
      propertyLocation: new FormGroup({
        streetNo: new FormControl('', [Validators.required]),
        barangay: new FormControl('', [Validators.required]),
        subdivision: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        province: new FormControl('', [Validators.required]),
        north: new FormControl('', [Validators.required]),
        south: new FormControl('', [Validators.required]),
        east: new FormControl('', [Validators.required]),
        west: new FormControl('', [Validators.required])
      }),
      ownerDetails: new FormGroup({
        ownfName: new FormControl(''),
        ownmName: new FormControl(''),
        ownlName: new FormControl(''),
        ownaddress: new FormControl(''),
        owncontact: new FormControl(''),
        ownTIN: new FormControl(''),
      }),
      adminOwnerLs: new FormGroup({
        admfName: new FormControl(''),
        admmName: new FormControl(''),
        admlName: new FormControl(''),
        admaddress: new FormControl(''),
        admcontact: new FormControl(''),
        admTIN: new FormControl(''),
      }),
      landAppraisal: new FormGroup({
        class: new FormControl(''),
        subclass: new FormControl(''),
        area: new FormControl(''),
        unitVal: new FormControl(''),
        baseMarketVal: new FormControl(''),
        interiorLot: new FormControl(''),
        cornerLot: new FormControl(''),
        stripping: new FormControl('')
      }),
      stripSet: new FormGroup({
        stripCount: new FormControl({ value: '', disabled: true }),
        remLandArea: new FormControl({ value: '', disabled: true }),
        stripArea: new FormControl({ value: '', disabled: true }),
        adjustment: new FormControl({ value: '', disabled: true }),
        stripNo: new FormControl({ value: '', disabled: true })
      }),
      otherImprovements: new FormGroup({
        kind: new FormControl(''),
        totalNo: new FormControl(''),
        unitVal: new FormControl(''),
        basicMarketVal: new FormControl(''),
        othImpSubTotal: new FormControl({ value: '', disabled: true })
      }),
      marketVal: new FormGroup({
        baseMarketVal: new FormControl(''),
        adjustmentFactor: new FormControl(''),
        adjustmentPercent: new FormControl(''),
        adjustmentVal: new FormControl(''),
        marketVal: new FormControl(''),
        mvSubTotal: new FormControl({ value: '', disabled: true })
      }),
      propertyAssessment: new FormGroup({
        actualUse: new FormControl(''),
        marketVal: new FormControl(''),
        assessmentLvl: new FormControl(''),
        assessedVal: new FormControl(''),
        specialClass: new FormControl(''),
        status: new FormControl(''),
        efftQ: new FormControl(''),
        effty: new FormControl(''),
        total: new FormControl(''),
        appraisedName: new FormControl(''),
        appraisedDate: new FormControl(''),
        recommendName: new FormControl(''),
        recommendDate: new FormControl(''),
        approvedName: new FormControl(''),
        approvedDate: new FormControl(''),
        memoranda: new FormControl('')
      }),
      supersededRec: new FormGroup({
        supPin: new FormControl(''),
        supArpNo: new FormControl(''),
        supTDNo: new FormControl(''),
        supTotalAssessedVal: new FormControl(''),
        supPrevOwner: new FormControl(''),
        supEff: new FormControl(''),
        supARPageNo: new FormControl(''),
        supRecPersonnel: new FormControl(''),
        supDate: new FormControl(''),
      }),
      status: new FormControl(''),
      dateCreated: new FormControl(''),
      encoder: new FormControl(''),
      attachment: new FormControl(''),
    })
  }

}

export default LandReassessmentComponent