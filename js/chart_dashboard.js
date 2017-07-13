$(function()
{
  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = '<your_region>'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: '<your_cognito_identity_pool_id>',
  });

  AWS.config.credentials.get(function(err)
  {
      if (err)
      {
          console.log("Error: "+err);
          return;
      }
      console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);
      var cognitoSyncClient = new AWS.CognitoSync();
      cognitoSyncClient.listDatasets(
        {
          IdentityId: AWS.config.credentials.identityId,
          IdentityPoolId: "<your_cognito_identity_pool_id>"
        },
        function(err, data)
        {
          if ( !err )
          {
              console.log(JSON.stringify(data));
          }
          //you can now check that you can describe the DynamoDB table
          var params = {TableName: "<your_table>" };
          var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
          dynamodb.describeTable(params, function(err, data)
          {
              console.log(JSON.stringify(data));
          });
          //Query DynamoDB using the new documentClient
          params['ExpressionAttributeNames'] = {
            '#id': '_id'
          }
          params['ExpressionAttributeValues'] = {
            ':key': "<your_grouping_id>"
          }
          params['KeyConditionExpression'] = "#id =:key";
          var docClient = new AWS.DynamoDB.DocumentClient();
          docClient.query(params, function(err, data)
          {
            if (err)
            {
              console.log(err, err.stack); // an error occurred
            }
            else
            {
              var chart_data = [];
                data.Items.forEach(function(item)
                {
                    chart_data.push({x:item.x, y:item.y})

                });
                var line_data =
                {
                  datasets : [
                  {
                      label: "Points",
                      backgroundColor : "rgba(151,187,205,0.2)",
                      borderColor : "rgba(151,187,205,1)",
                      pointBackgroundColor : "rgba(151,187,205,1)",
                      pointBorderColor : "#fff",
                      pointHoverBorderColor : "#fff",
                      pointHoverBackgroundColor : "rgba(151,187,205,1)",
                      data: chart_data
                   }
                  ]
                };
                console.log(chart_data);
                var ctx = document.getElementById("canvas").getContext("2d");
                window.myLine = new Chart(
                  ctx,
                  {
                      type: 'scatter',
                      data:line_data
                  }
                );
            }
          });
        }
      );
  });
});
