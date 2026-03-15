using FMS.Models;
using FMS.Pagination;
using FMS.ServiceLayer.DTO.TripDto;

namespace FMS.ServiceLayer.Interface
{
    public interface ITripService
    {
        Task<PaginatedResult<TripListDto>> GetTripsAsync(TripParams @params);
        Task<TripStatsDto> GetTripStatsAsync();
        Task<OrderListDto> GetOrdersByIdAsync(int tripId);
        Task<OrderListDto> ConfirmTripStepAsync(int tripId, string stepKey);
        Task<PaginatedResult<BookedTripListDto>> GetBookedTripListAsync(BookedTripParams @params);
        Task<BookedTripStatsDto> GetBookedTripStatsAsync();

        Task<Trip> CreateBookingTripAsync(CreateBookingTripDto dto);
        Task<int> EstimateAndUpdateTripsAsync();
        Task<bool> CancelTripAsync(int tripId);
        Task<bool> ConfirmBookedTripAsync(int tripId);
     

    }
}
