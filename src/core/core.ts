import { Event, SubscriberFn, SubscriberMeta } from '../types';

export class Core {
    private subscribers: Map<string, SubscriberMeta[]> = new Map();

    subscribe(eventName: string, fn: SubscriberFn, id: string): void {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, []);
        }
        this.subscribers.get(eventName)!.push({ id, fn });
    }

    publish(event: Event): void {
        if (this.subscribers.has(event.name)) {
            this.subscribers.get(event.name)!.forEach(sub => {
                try {
                    sub.fn(event.payload);
                } catch (e) {
                    console.error(`Error in subscriber ${sub.id} for event ${event.name}:`, e);
                }
            });
        }
    }
}
