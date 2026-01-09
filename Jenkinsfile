// Define a Declarative Pipeline
pipeline {

    agent any


    tools {
        nodejs 'NodeJS_22.0.0'
        jdk 'jdk21'
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['qa'], 
        description: 'Select the environment for build.')
    }
     environment {
        REGISTRY = 'registry.omnimd.local:5000'
        TAG = "v1.${env.BUILD_NUMBER}"
        SERVICE = 'omnihealth-india-patient-ui'
        APP_NAME = 'omnihealth-india-patient-ui-app'
        PROFILE = "${params.ENVIRONMENT}"
        IMAGE = "${REGISTRY}/${SERVICE}-${PROFILE}:${TAG}"
        YAML_FILE_PATH = "/home/dhind/Digital_Health_Service/service/UI"
        YAML_FILE = "${YAML_FILE_PATH}/${SERVICE}.yaml"
     }

    // Stages define a series of steps in your pipeline.
    stages {
        stage('SonarQube Analysis') {
            steps {
                script {
                    echo 'Running Sonar Scanner in Docker'
                    // Remove any stale scanner cache
                    sh '''
                        echo "Cleaning old .scannerwork..."
                        rm -rf $WORKSPACE/.scannerwork || true
                    '''
                    withSonarQubeEnv('SonarQube_Digital-Health-India') {
                        withCredentials([string(credentialsId: 'Digital-Health-India', variable: 'SONAR_TOKEN')]) {
                            sh '''
                              npx --yes sonar-scanner@3.1.0 -Dsonar.token=$SONAR_TOKEN
                            '''
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to SonarQube Quality Gate failure: ${qg.status}"
                        }
                    }
                }
            }
        }
        stage('Docker Build') {
            steps {
                script {
                    echo "Building Docker image with tag: ${IMAGE}"

                    sh "docker build --build-arg PROFILE=${PROFILE} -t ${IMAGE} ."

                    echo "Docker image build complete: ${env.IMAGE}"
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                       sh 'docker --version'
                    sh 'docker images'
                    sh "docker push ${IMAGE}"
                    try {
                        sh 'docker images | grep none | awk "{ print $3; }" | xargs docker rmi'
                    } catch (Exception e) {
                        echo 'Exception occurred in remove Image with Tag None : ' + e.toString()
                    }

                    sh 'docker images'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying.......'
                    echo "Deploying to ${PROFILE} environment..."

                    def serverAddress
                    def sshCredentialsId
                    switch (PROFILE) {
                    case 'qa':
                        serverAddress = 'dhind-master-qa.omnimd.com'
                        sshCredentialsId = 'a27c6a2c-bae6-44e5-b2ce-f35a3b483e53'
                        break
                    default:
                        error "Invalid environment selected: ${PROFILE}"
                    }
                    sshagent(credentials: [sshCredentialsId]) {
                        try {
                            sh """
                                ssh -o StrictHostKeyChecking=no root@${serverAddress} ' 
                                sed -i "s|image: .*|image: ${IMAGE}|" ${YAML_FILE} 
                                ' 
                            """
                        } catch (Exception e) {
                            echo 'Exception occurred in update YAML File : ' + e.toString()
                        }
                        
                        try {
                            sh "ssh -o StrictHostKeyChecking=no root@${serverAddress} kubectl set image deployment/${APP_NAME} ${APP_NAME}=${IMAGE} --record"
                            sh "ssh -o StrictHostKeyChecking=no root@${serverAddress} kubectl rollout status deployment ${APP_NAME} --timeout=120m"
                        } catch (Exception e) {
                            echo 'Exception occurred in executing kubectl set/rollout image command  : ' + e.toString()
                        }
                    }
                    echo 'Deployed.......'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Angular SSR Docker deployment pipeline finished successfully!'
        }
        failure {
            echo 'Angular SSR Docker deployment pipeline failed! Review logs for errors.'
        }
    }
}
