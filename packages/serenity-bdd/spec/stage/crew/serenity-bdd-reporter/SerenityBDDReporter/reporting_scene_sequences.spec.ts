import 'mocha';

import { expect } from '@integration/testing-tools';
import { StageManager } from '@serenity-js/core';
import { SceneFinished, SceneParametersDetected, SceneSequenceDetected, SceneStarts, SceneTemplateDetected, TestRunFinishes } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, Description, ExecutionFailedWithError, ExecutionSuccessful, Name, ScenarioDetails, ScenarioParameters } from '@serenity-js/core/lib/model';
import * as sinon from 'sinon';

import { SerenityBDDReporter } from '../../../../../src/stage';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { given } from '../../given';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        const env = create();

        stageManager    = env.stageManager;
        reporter        = env.reporter;
    });

    // see examples/cucumber/features/reporting_results/reports_scenario_outlines.feature for more context
    const
        category = new Category('Reporting results'),
        name     = new Name('Reports scenario outlines'),
        path     = new Path(`reporting_results/reports_scenario_outlines.feature`),
        template = new Description(`
            When <Developer> makes a contribution of:
              | value      |
              | time       |
              | talent     |
              | great code |
            Then they help bring serenity to fellow devs
        `),
        sequence = new ScenarioDetails(name, category, new FileSystemLocation(
            path,
            7,
        )),
        scenario1 = new ScenarioDetails(name, category, new FileSystemLocation(
            path,
            25,
        )),
        scenario2 = new ScenarioDetails(name, category, new FileSystemLocation(
            path,
            26,
        ))
    ;

    /**
     * @test {SerenityBDDReporter}
     * @test {SceneSequenceDetected}
     * @test {SceneTemplateDetected}
     * @test {SceneParametersDetected}
     * @test {ScenarioParameters}
     * @test {SceneStarts}
     * @test {SceneFinished}
     * @test {ExecutionSuccessful}
     * @test {TestRunFinishes}
     */
    it('captures information about a sequence of scenes (2 scenes in a sequence)', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneSequenceDetected(sequence),
                new SceneTemplateDetected(template),
                new SceneParametersDetected(
                    scenario1,
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'jan-molak', Twitter_Handle: '@JanMolak' },
                    ),
                ),
                new SceneStarts(scenario1),
                new SceneFinished(scenario1, new ExecutionSuccessful()),
            new SceneSequenceDetected(sequence),
                new SceneTemplateDetected(template),
                new SceneParametersDetected(
                    scenario2,
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'wakaleo', Twitter_Handle: '@wakaleo' },
                    ),
                ),
                new SceneStarts(scenario2),
                new SceneFinished(scenario2, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

        expect(report.name).to.equal(name.value);
        expect(report.dataTable).to.exist;  // tslint:disable-line:no-unused-expression
        expect(report.dataTable.scenarioOutline).to.equal(template.value);
        expect(report.dataTable.headers).to.deep.equal([
            'Developer',
            'Twitter_Handle',
        ]);

        expect(report.dataTable.dataSetDescriptors).to.deep.equal([{
            startRow: 0,
            rowCount: 2,
            name: 'Serenity/JS contributors',
            description: 'Some of the people who have contributed their time and talent to the Serenity/JS project',
        }]);

        expect(report.dataTable.rows).to.deep.equal([
            { values: [ 'jan-molak', '@JanMolak' ], result: 'SUCCESS' },
            { values: [ 'wakaleo', '@wakaleo' ], result: 'SUCCESS' },
        ]);

        expect(report.testSteps).to.have.lengthOf(2);
        expect(report.testSteps[0].description)
            .to.equal(`${name.value} #1 - Developer: jan-molak, Twitter_Handle: @JanMolak`);

        expect(report.testSteps[1].description)
            .to.equal(`${name.value} #2 - Developer: wakaleo, Twitter_Handle: @wakaleo`);
    });

    /**
     * @test {SerenityBDDReporter}
     * @test {SceneSequenceDetected}
     * @test {SceneTemplateDetected}
     * @test {SceneParametersDetected}
     * @test {ScenarioParameters}
     * @test {SceneStarts}
     * @test {SceneFinished}
     * @test {ExecutionFailedWithError}
     * @test {ExecutionSuccessful}
     * @test {TestRunFinishes}
     */
    it('determines the result of the sequence based on the worst result of the contributing scenarios', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneSequenceDetected(sequence),
                new SceneTemplateDetected(template),
                new SceneParametersDetected(
                    scenario1,
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'jan-molak', Twitter_Handle: '@JanMolak' },
                    ),
                ),
                new SceneStarts(scenario1),
                new SceneFinished(scenario1, new ExecutionFailedWithError(new Error('Something happened'))),

            new SceneSequenceDetected(sequence),
                new SceneTemplateDetected(template),
                new SceneParametersDetected(
                    scenario2,
                    new ScenarioParameters(
                        new Name('Serenity/JS contributors'),
                        new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                        { Developer: 'wakaleo', Twitter_Handle: '@wakaleo' },
                    ),
                ),
                new SceneStarts(scenario2),
                new SceneFinished(scenario2, new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

        expect(report.dataTable.rows).to.deep.equal([
            { values: [ 'jan-molak', '@JanMolak' ], result: 'ERROR' },
            { values: [ 'wakaleo', '@wakaleo' ], result: 'SUCCESS' },
        ]);

        expect(report.testSteps).to.have.lengthOf(2);
        expect(report.testSteps[0].description)
            .to.equal(`${name.value} #1 - Developer: jan-molak, Twitter_Handle: @JanMolak`);
        // todo: check for error somewhere here
        // todo: map well map the main report

        expect(report.testSteps[1].description)
            .to.equal(`${name.value} #2 - Developer: wakaleo, Twitter_Handle: @wakaleo`);
    });
});
