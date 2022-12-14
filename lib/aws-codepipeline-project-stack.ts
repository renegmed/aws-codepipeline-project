import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { CDKPipelineStage } from './stage';
import { ManualApprovalStep } from 'aws-cdk-lib/pipelines';

export class AwsCodepipelineProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: "CDKTestPipeline", // Creating a new code pipeline which is a contstruct 
      synth: new ShellStep('Synth', {  // Add a new synthesis 'shellstep' which will be pointed at our github repository
        input: CodePipelineSource.gitHub('renegmed/aws-codepipeline-project', 'master'), // replace the GithHub repository 

          // The build steps for the pipeline are defined by these commands

          commands: [ 'npm ci',
                      'npm run build',
                      'npx cdk synth']
      }),
    });

    /*
      npm ci - (npm clean install), which is similar to npm install that is to be used in 
              automated environments.
      npm run build - to allow us to perform any necessary building/prep tasks for the project.
      npx cdk synth - to synthesize whatever we have in the cloud formation stack to generate 
              the self mutating pipeline.
    */

    // add the following code snippet to pass the stage that calls lambda 

    const testStage = pipeline.addStage(new CDKPipelineStage(this, "test", {
      env: { account: "731833107751", region: "us-east-1"}
    }));

    testStage.addPost(new ManualApprovalStep('Manual approval step'));
 
    const productionStage = pipeline.addStage(new CDKPipelineStage(this, "production", {
      env: { account: "731833107751", region: "us-east-1"}
    }));
  }
}
