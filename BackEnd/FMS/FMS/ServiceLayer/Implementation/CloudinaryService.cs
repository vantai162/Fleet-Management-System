using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FMS.ServiceLayer.Interface;

namespace FMS.ServiceLayer.Implementation
{
    public class CloudinaryService 
    {
        private readonly Cloudinary _cloudinary;
        public CloudinaryService(IConfiguration config)
        {
            var account = new Account(
                config["CloudinarySettings:CloudName"],
                config["CloudinarySettings:ApiKey"],
                config["CloudinarySettings:ApiSecret"]);
            _cloudinary = new Cloudinary(account);
        }
       
        public async Task<ImageUploadResult> UploadAsync(ImageUploadParams uploadParams)
        {
            if (uploadParams == null)
                throw new ArgumentNullException(nameof(uploadParams));

            // Gọi hàm upload của Cloudinary SDK
            var result = await _cloudinary.UploadAsync(uploadParams);

            // Kiểm tra kết quả
            if (result.StatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Upload failed: {result.Error?.Message}");
            }

            return result;
        }

        public async Task<DeletionResult> DestroyAsync(DeletionParams deletionParams)
        {
            if (deletionParams == null)
                throw new ArgumentNullException(nameof(deletionParams));

            // Gọi hàm xóa của Cloudinary SDK
            var result = await _cloudinary.DestroyAsync(deletionParams);

            // Kiểm tra kết quả
            // Cloudinary trả về StatusCode OK ngay cả khi public_id không tồn tại, 
            // nhưng result.Result sẽ là "not found". 
            // Tuy nhiên, để nhất quán với hàm Upload của bạn, ta kiểm tra StatusCode trước.
            if (result.StatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new InvalidOperationException($"Delete failed: {result.Error?.Message}");
            }

            return result;
        }
    }
}

