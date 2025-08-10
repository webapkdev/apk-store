const fs = require("fs");
const storageTemp = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/tmp");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storageTemp });

app.post("/upload-app", upload.fields([{ name: "icon" }, { name: "apk" }]), async (req, res) => {
    const { appName, description, uploader } = req.body;

    if (!req.files?.icon || !req.files?.apk) {
        return res.status(400).json({ success: false, message: "Icon and APK are required" });
    }

    // Upload icon to Supabase
    const iconFile = req.files.icon[0];
    const iconBuffer = fs.readFileSync(iconFile.path);
    const { data: iconUpload, error: iconError } = await supabase
        .storage
        .from("icons")
        .upload(iconFile.filename, iconBuffer, {
            contentType: iconFile.mimetype
        });

    if (iconError) return res.json({ success: false, message: iconError.message });

    const iconUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/icons/${iconFile.filename}`;

    // Upload APK to Supabase
    const apkFile = req.files.apk[0];
    const apkBuffer = fs.readFileSync(apkFile.path);
    const { data: apkUpload, error: apkError } = await supabase
        .storage
        .from("apks")
        .upload(apkFile.filename, apkBuffer, {
            contentType: apkFile.mimetype
        });

    if (apkError) return res.json({ success: false, message: apkError.message });

    const apkUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/apks/${apkFile.filename}`;

    // Insert into database
    const { error } = await supabase.from("apps").insert([
        {
            app_name: appName,
            description: description,
            icon: iconUrl,
            apk: apkUrl,
            uploader: uploader,
            approved: false
        }
    ]);

    if (error) return res.json({ success: false, message: error.message });

    res.json({ success: true, message: "App uploaded to Supabase Storage" });
});
