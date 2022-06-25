import ENetProjectInformationItem from './ENetProjectInformationItem'


class ENetProjectInformation {
  creationDate: string;
  changeDate: string;
  projectInformation: ENetProjectInformationItem[]

  constructor(creationDate: string, changeDate: string, projectInformation: ENetProjectInformationItem[]) {
    this.creationDate = creationDate;
    this.changeDate = changeDate;
    this.projectInformation = projectInformation;
  }
}


export default ENetProjectInformation