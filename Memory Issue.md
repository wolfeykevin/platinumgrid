
# Heroku Deployment Issues

## Issues and Errors
- Application exceeded available memory and was unable to start

## Steps and Resolution
- Run command `heroku login` to login to Heroku CLI
- Run command `heroku logs --tail -a <application-name>` to see the logs of the application
  - Verify that the application crashed due to exceeding memory limit
- Run command `heroku config:set NODE_OPTIONS="--max_old_space_size=2560" -a <application-name>` to set an environment variable increasing the available memory limit
  - Verify that the application started successfully

```
Modified solution from ZachHaines & rtg8008
```