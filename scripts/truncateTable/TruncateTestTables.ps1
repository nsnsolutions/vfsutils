#
# USE THIS TO TRUNCATE ALL THE TEST STACK DYNAMO TABLES
#

$jobTable = 'test-DDBVFSJob-BRNXC6TQ3Z40'
$jobItemTable = 'test-DDBemailJobItem-EGEM533V40E3'
$supressionTable = 'test-DDBVFSSuppression-13RF5TLVLS5TX'
$userTable = 'test-DDBVFSUser-1N234NYBIBJG'
$testTable = 'alan_delete_test'
$testTable2 = 'alan_delete_test2'
#$myTableArry = @($testTable,$testTable2)  # use for testing
$myTableArry = @($jobTable,$jobItemTable,$supressionTable,$userTable)

cd C:\Users\Alan\vfs\vfsutils\scripts\truncateTable

foreach ($table in $myTableArry){ 

truncateTable $table $table

test-DDBemailJobItem-EGEM533V40E3 test-DDBemailJobItem-EGEM533V40E3_bkup




aws dynamodb describe-table --table-name test-DDBemailJobItem-EGEM533V40E3
test-DDBVFSUser-1N234NYBIBJG test-DDBVFSUser-1N234NYBIBJG_bkup
test-DDBemailJobItem-EGEM533V40E3_bkup