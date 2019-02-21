import { AnswersQuestions, Interaction, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

export class Enter implements Interaction {
    static theValue(value: KnowableUnknown<string | number>) {
        return {
            into: (field: KnowableUnknown<ElementFinder>) => new Enter(value, field),
        };
    }

    constructor(
        private readonly value: KnowableUnknown<string | number>,
        private readonly field: KnowableUnknown<ElementFinder>,
    ) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return Promise.all([
            actor.answer(this.value),
            actor.answer(this.field),
        ]).then(([value, field]) => field.sendKeys(value));
    }

    toString(): string {
        return formatted `#actor enters ${this.value} into ${this.field}`;
    }
}
