export const SkeletonProjectsCard = () => {
  return (
    <div className="w-full">
      <div className="card w-full bg-base-100 shadow-sm border border-transparent animate-pulse">
        {/* Figure skeleton - Responsive height */}
        <figure className="relative overflow-hidden">
          <div className="w-full h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 bg-base-300"></div>

          {/* Botones skeleton - Responsive positioning and size */}
          <div className="absolute top-1 right-1 xs:top-2 xs:right-2 flex gap-1 xs:gap-2">
            <div className="btn btn-xs xs:btn-sm bg-base-300 border-0 p-1 xs:p-2">
              <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-base-content/20 rounded"></div>
            </div>
            <div className="btn btn-xs xs:btn-sm bg-base-300 border-0 p-1 xs:p-2">
              <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-base-content/20 rounded"></div>
            </div>
          </div>
        </figure>

        {/* Card body skeleton - Responsive padding */}
        <div className="card-body p-3 xs:p-4 sm:p-5 md:p-6">
          {/* Título y badge skeleton - Responsive sizes */}
          <div className="flex justify-between items-start mb-2 xs:mb-3 sm:mb-4">
            <div className="flex items-center gap-1 xs:gap-2 flex-wrap">
              <div className="h-4 xs:h-5 sm:h-6 bg-base-300 rounded w-20 xs:w-24 sm:w-32"></div>
              <div className="badge bg-base-300 border-0 h-3 xs:h-4 sm:h-5 w-12 xs:w-16 sm:w-20 text-xs xs:text-sm"></div>
            </div>
          </div>

          {/* Descripción skeleton - Responsive lines and spacing */}
          <div className="space-y-1 xs:space-y-2 mb-3 xs:mb-4">
            <div className="h-3 xs:h-4 bg-base-300 rounded w-full"></div>
            <div className="h-3 xs:h-4 bg-base-300 rounded w-4/5"></div>
            <div className="h-3 xs:h-4 bg-base-300 rounded w-3/5 sm:block hidden"></div>
          </div>

          {/* Card actions skeleton - Responsive avatar sizes */}
          <div className="card-actions justify-start">
            <div className="avatar-group -space-x-2 xs:-space-x-3">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="avatar">
                  <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-base-300 rounded-full border-2 border-base-100"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
