# Installing and running

## Locally
Requires Python 2.7.x

    # get the code
    git clone git@github.ibm.com:ets-hackday/toptrumps.git
    cd toptrumps

    # install the server-side dependencies
    pip install -r requirements.txt

    # install the web project dependencies
    cd static
    bower install
    cd ..

    # run locally
    export VCAP_APP_HOST=127.0.0.1
    python server.py

## Bluemix
  
    cf push
  
