import { Task, getDefaultTask } from './taskModelManager';

export interface ExtendedTask extends Task {
  nameEdit?: boolean;
  todoEdit?: boolean;
  whyEdit?: boolean;
  timeCreatedEdit?: boolean;
  lastUpdatedEdit?: boolean;
  timeEndEdit?: boolean;
  durationEdit?: boolean;
  overlordEdit?: boolean;
  repeatEdit?: boolean;
  statusEdit?: boolean;
  stageEdit?: boolean;
  typeEdit?: boolean;
  subtypeEdit?: boolean;
  sizeEdit?: boolean;
  ownerEdit?: boolean;
  priorityEdit?: boolean;
  backupLinkEdit?: boolean;
  imageUrlEdit?: boolean;
  imageDataUrlEdit?: boolean;
  tagsEdit?: boolean;
}

export function getDefaultEditTask(): ExtendedTask {
  const defaultTask = getDefaultTask();
  return {
    ...defaultTask,
    nameEdit: false,
    todoEdit: false,
    whyEdit: false,
    timeCreatedEdit: false,
    lastUpdatedEdit: false,
    timeEndEdit: false,
    durationEdit: false,
    overlordEdit: false,
    repeatEdit: false,
    statusEdit: false,
    stageEdit: false,
    typeEdit: false,
    subtypeEdit: false,
    sizeEdit: false,
    ownerEdit: false,
    priorityEdit: false,
    backupLinkEdit: false,
    imageUrlEdit: false,
    imageDataUrlEdit: false,
    tagsEdit: false,
  };
}
