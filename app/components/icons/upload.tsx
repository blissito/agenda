export const Upload = ({
  className,
  fill = "currentColor",
}: {
  fill?: string;
  className?: string;
}) => {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.53 9.00081H22.93C22.6922 7.33223 21.8604 5.80545 20.5874 4.70092C19.3143 3.59639 17.6854 2.98828 16 2.98828C14.3146 2.98828 12.6857 3.59639 11.4126 4.70092C10.1396 5.80545 9.30776 7.33223 9.07 9.00081H8.47C7.02008 9.00345 5.6303 9.5806 4.60505 10.6059C3.57979 11.6311 3.00264 13.0209 3 14.4708V15.5308C3.00264 16.9807 3.57979 18.3705 4.60505 19.3958C5.6303 20.421 7.02008 20.9982 8.47 21.0008C8.73522 21.0008 8.98957 20.8955 9.17711 20.7079C9.36464 20.5204 9.47 20.266 9.47 20.0008C9.47 19.7356 9.36464 19.4812 9.17711 19.2937C8.98957 19.1062 8.73522 19.0008 8.47 19.0008C7.55051 18.9982 6.66943 18.6317 6.01925 17.9816C5.36907 17.3314 5.00264 16.4503 5 15.5308V14.4708C5.00264 13.5513 5.36907 12.6702 6.01925 12.0201C6.66943 11.3699 7.55051 11.0034 8.47 11.0008H10C10.2652 11.0008 10.5196 10.8955 10.7071 10.7079C10.8946 10.5204 11 10.266 11 10.0008C11 8.67473 11.5268 7.40296 12.4645 6.46528C13.4021 5.52759 14.6739 5.00081 16 5.00081C17.3261 5.00081 18.5979 5.52759 19.5355 6.46528C20.4732 7.40296 21 8.67473 21 10.0008C21 10.266 21.1054 10.5204 21.2929 10.7079C21.4804 10.8955 21.7348 11.0008 22 11.0008H23.53C24.4495 11.0034 25.3306 11.3699 25.9807 12.0201C26.6309 12.6702 26.9974 13.5513 27 14.4708V15.5308C26.9974 16.4503 26.6309 17.3314 25.9807 17.9816C25.3306 18.6317 24.4495 18.9982 23.53 19.0008C23.2648 19.0008 23.0104 19.1062 22.8229 19.2937C22.6354 19.4812 22.53 19.7356 22.53 20.0008C22.53 20.266 22.6354 20.5204 22.8229 20.7079C23.0104 20.8955 23.2648 21.0008 23.53 21.0008C24.9799 20.9982 26.3697 20.421 27.395 19.3958C28.4202 18.3705 28.9974 16.9807 29 15.5308V14.4708C28.9974 13.0209 28.4202 11.6311 27.395 10.6059C26.3697 9.5806 24.9799 9.00345 23.53 9.00081Z"
        fill={fill}
      />
      <path
        d="M16.7099 13.2909C16.6148 13.1998 16.5027 13.1285 16.3799 13.0809C16.1365 12.9809 15.8634 12.9809 15.6199 13.0809C15.4972 13.1285 15.385 13.1998 15.2899 13.2909L11.2899 17.2909C11.1962 17.3838 11.1218 17.4944 11.071 17.6163C11.0203 17.7382 10.9941 17.8689 10.9941 18.0009C10.9941 18.1329 11.0203 18.2636 11.071 18.3854C11.1218 18.5073 11.1962 18.6179 11.2899 18.7109C11.3829 18.8046 11.4935 18.879 11.6154 18.9298C11.7372 18.9805 11.8679 19.0067 11.9999 19.0067C12.132 19.0067 12.2627 18.9805 12.3845 18.9298C12.5064 18.879 12.617 18.8046 12.7099 18.7109L14.9999 16.4109V28.0009C14.9999 28.2661 15.1053 28.5204 15.2928 28.708C15.4804 28.8955 15.7347 29.0009 15.9999 29.0009C16.2652 29.0009 16.5195 28.8955 16.707 28.708C16.8946 28.5204 16.9999 28.2661 16.9999 28.0009V16.4109L19.2899 18.7109C19.3829 18.8046 19.4935 18.879 19.6154 18.9298C19.7372 18.9805 19.8679 19.0067 19.9999 19.0067C20.132 19.0067 20.2627 18.9805 20.3845 18.9298C20.5064 18.879 20.617 18.8046 20.7099 18.7109C20.8037 18.6179 20.8781 18.5073 20.9288 18.3854C20.9796 18.2636 21.0057 18.1329 21.0057 18.0009C21.0057 17.8689 20.9796 17.7382 20.9288 17.6163C20.8781 17.4944 20.8037 17.3838 20.7099 17.2909L16.7099 13.2909Z"
        fill={fill}
      />
    </svg>
  );
};
