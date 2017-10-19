# How to manually chunk upload
This code gives you an example of how to manual upload via chunks

## To run code
1. Get a file to upload that is larger than 50MB
2. Make config.json file
3. config file will need json object that looks like following:
```
{
	"CLIENT_ID": "INSERT_CLIENT_ID",
	"CLIENT_SECRET": "INSERT_CLIENT_SECRET",
	"DEVELOPER_TOKEN": "INSERT_DEV_TOKEN",
	"FILE_PATH": "INSERT_PATH_TO_FILE",
	"FILE_NAME": "INSERT_NAME_TO_CALL_FILE",
	"FOLDER_ID": "INSERT_PARENT_FOLDER_ID"
}

```