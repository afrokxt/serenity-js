import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { by } from 'protractor';

import { Attribute, Navigate, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Attribute', () => {

    /** @test {Attribute} */
    it('allows the actor to read an attribute of a DOM element', () => actorCalled('Bernie').attemptsTo(
        Navigate.to(pageFromTemplate(`
            <html lang="en" />
        `)),

        Ensure.that(Attribute.of(Target.the('DOM').located(by.tagName('html'))).called('lang'), equals('en')),
    ));
});
