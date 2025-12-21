import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskSession } from '../task-session.model';

@Injectable({ providedIn: 'root' })
export class TaskSessionRunnerService {
  private worker?: Worker;
  private remainingTimeSubject = new BehaviorSubject<number>(0);
  private runningSessionSubject = new BehaviorSubject<TaskSession | null>(null);
  private audioContext?: AudioContext;
  private endBuffers: AudioBuffer[] = [];

  remainingTime$ = this.remainingTimeSubject.asObservable();
  runningSession$ = this.runningSessionSubject.asObservable();

  // expose snapshot accessors for components that need to correlate by id
  get runningSessionSnapshot(): TaskSession | null {
    return this.runningSessionSubject.value;
  }

  get runningSessionId(): string | null {
    return this.runningSessionSubject.value ? this.runningSessionSubject.value.id : null;
  }

  constructor() {}

  private async initAudio(): Promise<void> {
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.audioContext = new AC();

      const urls = ['assets/end.wav', 'assets/session.wav', 'assets/over.wav'];
      const responses = await Promise.all(urls.map((u) => fetch(u).catch(() => null)));
      const okResponses = responses.filter((r) => r && r.ok) as Response[];
      if (!okResponses.length) return;

      const arrayBuffers = await Promise.all(okResponses.map((r) => r.arrayBuffer()));
      if (!this.audioContext) return;
      const ac = this.audioContext;
      const decodeAny = (ac.decodeAudioData as any).bind(ac);

      const buffers: AudioBuffer[] = [];
      for (const ab of arrayBuffers) {
        if (decodeAny.length === 1) {
          // modern promise-based
          // @ts-ignore
          buffers.push(await (ac.decodeAudioData as any)(ab));
        } else {
          buffers.push(
            await new Promise<AudioBuffer>((resolve, reject) => decodeAny(ab, resolve, reject))
          );
        }
      }
      this.endBuffers = buffers;
    } catch (e) {
      this.endBuffers = [];
    }
  }

  start(session: TaskSession, durationOverride?: number) {
    this.stop();
    const duration = durationOverride ?? session.duration;
    this.remainingTimeSubject.next(duration);
    this.runningSessionSubject.next(session);

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../session/timer.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        if (data.done) {
          this.remainingTimeSubject.next(0);
          this.playSound();
          this.finish();
        } else {
          this.remainingTimeSubject.next(data.remainingTime);
        }
      };
      this.worker.postMessage({ duration });
    } else {
      console.error('Web Workers are not supported in this environment.');
    }
    // attempt to preload audio so it plays promptly when the timer finishes
    void this.initAudio();
  }

  stop() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
    this.runningSessionSubject.next(null);
    this.remainingTimeSubject.next(0);
  }

  private finish() {
    // keep runningSession until explicitly stopped? we'll clear but emit null
    const finished = this.runningSessionSubject.value;
    this.runningSessionSubject.next(null);
    // Note: callers can subscribe to remainingTime$ and runningSession$ to react
  }

  private playSound(): void {
    // Prefer WebAudio if available and decoded
    // Prefer WebAudio if available and decoded; schedule buffers sequentially
    try {
      if (this.audioContext && this.endBuffers && this.endBuffers.length) {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
        const now = this.audioContext.currentTime + 0.05; // small offset
        let offset = now;
        for (const buf of this.endBuffers) {
          const src = this.audioContext.createBufferSource();
          src.buffer = buf;
          src.connect(this.audioContext.destination);
          try {
            src.start(offset);
          } catch (e) {
            // ignore start errors for this buffer
          }
          offset += buf.duration;
        }
        return;
      }
    } catch (e) {
      // fall back to HTML Audio below
    }

    // Fallback: chain HTMLAudio elements to play sequentially
    try {
      const chain = ['assets/end.wav', 'assets/session.wav', 'assets/over.wav'];
      const elements: HTMLAudioElement[] = chain.map((src) => {
        const a = new Audio(src);
        a.preload = 'auto';
        return a;
      });
      for (let i = 0; i < elements.length - 1; i++) {
        const curr = elements[i];
        const next = elements[i + 1];
        curr.addEventListener('ended', () => next.play().catch(() => {}));
      }
      if (elements.length) elements[0].play().catch(() => {});
    } catch (e) {
      // ignore
    }
  }
}
