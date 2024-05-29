import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { TaskTemplate } from '../models/template';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  constructor(private firestore: Firestore) {}

  async getTemplate(templateId: string): Promise<TaskTemplate | null> {
    const templateRef = doc(this.firestore, `templates/${templateId}`);
    const templateSnap = await getDoc(templateRef);
    return templateSnap.exists() ? (templateSnap.data() as TaskTemplate) : null;
  }
}
