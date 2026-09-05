export interface FileAction {

  id: number;
  fileId: number;
  action: string;
  fromStage: string | null;
  toStage: string | null;
  remarks: string | null;
  performedBy: number | null;
  performedByUsername: string | null;
  performedByName: string | null;
  performedAt: string;

}
