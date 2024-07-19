export const Comment = ({
  fill = "#5158F6",
  className,
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    className={className}
    width="58"
    height="53"
    viewBox="0 0 58 53"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.2707 5.22912C15.1121 5.12209 18.9374 5.70374 22.7562 6.02499C26.8213 6.36694 30.9052 6.34106 34.9781 6.52864C37.4061 6.64047 39.8393 6.76889 42.2649 6.92485C43.4382 7.00027 44.5974 7.13394 45.7592 7.31079C46.889 7.48278 48.0251 7.61431 49.1455 7.84397C48.988 7.81152 48.8305 7.779 48.673 7.74654C49.0886 7.83439 49.5 7.93579 49.9059 8.06102C50.0984 8.12039 50.2878 8.18907 50.4754 8.26201C50.5559 8.29326 50.6334 8.32914 50.7114 8.36595C50.1708 8.11045 50.4504 8.23212 50.5716 8.29899C50.8295 8.44136 51.0698 8.6136 51.2946 8.80349C50.7824 8.37072 51.1899 8.71646 51.3044 8.83869C51.4144 8.95611 51.5147 9.08224 51.6107 9.21123C51.6934 9.32229 51.849 9.57276 51.5106 9.05452C51.5481 9.11194 51.5829 9.17091 51.6177 9.22994C51.6878 9.34842 51.7499 9.47131 51.8097 9.59518C51.8699 9.72026 51.9226 9.84892 51.973 9.97826C52.0236 10.108 52.1153 10.3954 51.9161 9.80159C51.9461 9.89119 51.9727 9.98204 51.9987 10.0729C52.1685 10.6649 52.2494 11.2804 52.2917 11.8934C52.2815 11.7329 52.2712 11.5725 52.261 11.4119C52.4135 13.8458 51.8909 16.2445 51.8201 18.6698C51.7573 20.8211 51.9033 22.9776 51.9637 25.1275C52.046 28.0554 52.0797 31.0466 51.4861 33.9291C51.5185 33.7716 51.551 33.6141 51.5835 33.4566C51.4168 34.2504 51.1973 35.0328 50.888 35.7835C50.814 35.9632 50.733 36.14 50.6476 36.3145C50.5697 36.471 50.6141 36.3834 50.7808 36.0519C50.7548 36.1025 50.7278 36.1524 50.7008 36.2024C50.6561 36.2848 50.6091 36.3659 50.5614 36.4466C50.376 36.7606 50.1634 37.0582 49.9281 37.3367C49.7877 37.5028 50.3127 36.9212 50.0192 37.2313C49.9583 37.2956 49.8949 37.3576 49.8309 37.4189C49.7034 37.5411 49.5681 37.6548 49.4288 37.7633C49.359 37.8177 49.287 37.8691 49.2145 37.9197C49.5244 37.7151 49.6077 37.6595 49.4643 37.753C49.4195 37.7822 49.3737 37.8099 49.3281 37.8376C49.1738 37.9311 49.0131 38.0134 48.8497 38.0896C48.7664 38.1284 48.6815 38.1636 48.5963 38.1979C48.5617 38.2116 48.527 38.225 48.4921 38.2378C48.2371 38.3341 48.9806 38.0752 48.7203 38.161C48.5365 38.2216 48.3486 38.2693 48.1595 38.3107C47.7244 38.4057 47.2782 38.4406 46.8347 38.4696C46.9951 38.4594 47.1556 38.4491 47.3161 38.4389C44.5206 38.6101 41.7081 38.2346 38.9434 37.8612C36.0945 37.4765 33.2432 37.0085 30.3669 36.8882C29.0309 36.8324 27.6717 36.8626 26.3495 37.0727C25.2607 37.2456 24.1228 37.5817 23.1983 38.1969C22.904 38.3926 22.6144 38.5799 22.35 38.8138C22.1028 39.0325 21.8835 39.2833 21.6465 39.5129C21.0325 40.1077 20.3726 40.6543 19.7037 41.1858C18.2823 42.3156 16.797 43.3623 15.3802 44.498C14.6578 45.077 13.9555 45.6828 13.3031 46.3402C14.2945 46.8345 15.2858 47.3288 16.2772 47.8231C16.8566 44.712 16.7208 41.5464 16.9359 38.403C16.9684 37.9287 16.8111 37.4564 16.4991 37.0976C16.0509 36.582 15.4392 36.4398 14.7858 36.5141C14.5101 36.5455 14.2338 36.5699 13.957 36.5885C14.1174 36.5782 14.2779 36.568 14.4384 36.5578C12.8752 36.6561 11.2928 36.5762 9.75693 36.2606C9.9144 36.2931 10.0719 36.3256 10.2294 36.3581C9.40408 36.1831 8.59552 35.9368 7.83342 35.5719C7.56054 35.4412 8.29011 35.8145 7.90414 35.604C7.81439 35.555 7.72655 35.5026 7.63915 35.4496C7.46736 35.3455 7.30265 35.2305 7.14226 35.1098C7.06336 35.0503 6.98734 34.9873 6.91189 34.9237C7.39345 35.3298 7.09166 35.0848 6.98596 34.9812C6.84753 34.8458 6.72105 34.6988 6.60129 34.5468C6.51098 34.4321 6.29752 34.1008 6.64735 34.634C6.59655 34.5566 6.55087 34.476 6.50424 34.396C6.42088 34.253 6.35005 34.1029 6.2835 33.9515C6.24845 33.8716 6.21686 33.7902 6.18566 33.7088C6.03968 33.3278 6.31531 34.107 6.22542 33.829C6.1667 33.6475 6.11779 33.463 6.07215 33.2778C5.86621 32.4421 5.77559 31.5787 5.72067 30.7214C5.73089 30.8818 5.74117 31.0424 5.75139 31.2028C5.5897 28.5233 5.84927 25.8537 6.02215 23.1825C6.13998 21.362 6.16014 19.536 6.2615 17.7146C6.38559 15.485 6.5871 13.2498 7.03497 11.0595C7.00251 11.217 6.97 11.3745 6.93754 11.5319C7.13084 10.5982 7.37074 9.67389 7.69151 8.77542C7.83685 8.36834 8.00215 7.96845 8.18747 7.57795C8.20384 7.54362 8.22046 7.50943 8.23721 7.47531C8.3574 7.2288 8.0032 7.93221 8.12824 7.68926C8.17928 7.59013 8.23274 7.49226 8.28713 7.3949C8.39311 7.20522 8.50752 7.02031 8.62771 6.83928C8.7343 6.67868 8.84852 6.52325 8.96761 6.37163C9.02062 6.30419 9.07564 6.23837 9.1312 6.1731C9.2995 5.97534 8.7861 6.55584 8.96033 6.36436C8.9943 6.32701 9.02917 6.29056 9.06411 6.25411C9.19032 6.12231 9.32448 5.9984 9.46321 5.87997C9.53792 5.81623 9.61529 5.75577 9.69354 5.6966C9.7325 5.66713 9.77233 5.63888 9.81211 5.61062C10.0198 5.46321 9.3777 5.89569 9.59112 5.75711C9.74079 5.65992 9.89748 5.5739 10.0575 5.49514C10.2418 5.4043 10.9023 5.17612 10.1623 5.42462C10.5371 5.29874 10.9292 5.23068 11.3229 5.20257C11.1625 5.21279 11.002 5.22308 10.8415 5.2333C11.2425 5.20892 11.6419 5.22907 12.0398 5.28309C13.0123 5.41516 13.8943 4.54423 13.9593 3.61442C14.0311 2.58825 13.2618 1.82668 12.2907 1.69484C11.1005 1.53325 9.9407 1.69709 8.82267 2.11483C7.78331 2.50318 6.94699 3.24956 6.22644 4.06856C4.86453 5.61661 4.14721 7.71917 3.68441 9.69575C2.70137 13.8939 2.67977 18.1798 2.4609 22.4607C2.33245 24.9727 2.06102 27.4694 2.1217 29.9892C2.15715 31.462 2.24195 32.9851 2.6576 34.4074C3.10786 35.9482 3.92831 37.2143 5.23448 38.1705C6.72802 39.2639 8.61684 39.7451 10.418 40.0088C12.0943 40.2543 13.8174 40.2324 15.4978 40.0411C14.7812 39.4115 14.0644 38.7819 13.3478 38.1523C13.1327 41.2957 13.2685 44.4613 12.6891 47.5723C12.5768 48.1752 12.992 48.8573 13.4693 49.1836C14.0995 49.6146 15.0998 49.6229 15.6631 49.0552C18.0626 46.6371 21.0477 44.9077 23.5721 42.633C24.0299 42.2205 24.4325 41.7413 24.9144 41.3571C25.0457 41.2524 25.4318 40.997 24.8379 41.392C24.9291 41.3315 25.0234 41.2757 25.1185 41.2215C25.3143 41.1099 25.5193 41.0148 25.7273 40.9282C25.835 40.8834 25.9445 40.8432 26.0545 40.8044C25.3783 41.0431 25.8504 40.8763 26.0132 40.8292C26.2533 40.7599 26.4974 40.7048 26.7424 40.6564C27.2727 40.5518 27.8116 40.4944 28.3505 40.4594C28.1901 40.4696 28.0296 40.4799 27.8691 40.4901C30.5929 40.3249 33.3373 40.7162 36.0299 41.0831C38.916 41.4763 41.8057 41.9372 44.7206 42.0478C46.0686 42.0989 47.4861 42.1121 48.8134 41.8498C49.9827 41.6188 51.0864 41.0815 51.9944 40.3113C53.834 38.7513 54.6178 36.3983 55.0879 34.1161C55.5647 31.8015 55.6109 29.4062 55.586 27.0514C55.562 24.7743 55.4222 22.5001 55.3994 20.223C55.3766 17.9521 55.7542 15.7222 55.8584 13.4588C55.9934 10.5269 55.522 7.3125 52.9195 5.52503C51.338 4.43888 49.2764 4.19176 47.4251 3.92555C45.5516 3.65623 43.6965 3.40062 41.8047 3.29422C37.7511 3.06621 33.6994 2.87206 29.6408 2.75985C26.5734 2.6751 23.5227 2.50356 20.469 2.19976C17.4983 1.90427 14.5122 1.55785 11.5218 1.6412C11.0258 1.655 10.6032 1.7418 10.2164 2.07798C9.85803 2.38948 9.63538 2.8359 9.60224 3.30987C9.53873 4.21525 10.2889 5.25654 11.2707 5.22912Z"
      fill={fill}
    />
    <path
      d="M14.6125 18.2131C22.9014 18.9594 31.1912 19.7004 39.4901 20.3268C40.9289 20.4355 42.3679 20.5402 43.8072 20.641C44.7853 20.7094 45.6584 19.9502 45.7268 18.9723C45.7952 17.9942 45.0362 17.1212 44.0581 17.0527C35.7562 16.4715 27.4645 15.753 19.1754 15.012C17.738 14.8835 16.3008 14.7543 14.8634 14.6248C13.8868 14.5369 13.0112 15.3303 12.9439 16.2935C12.8744 17.2863 13.6363 18.1252 14.6125 18.2131Z"
      fill={fill}
    />
    <path
      d="M13.6097 27.0295C19.6497 27.4433 25.7827 26.5639 31.7618 27.7784C31.6043 27.7459 31.4468 27.7135 31.2894 27.681C32.173 27.8648 33.0446 28.0951 33.8999 28.3839C34.8282 28.6974 35.8663 28.2181 36.1945 27.2852C36.5166 26.3697 36.0242 25.304 35.0957 24.9905C28.2369 22.6744 20.933 23.9257 13.8606 23.4412C12.8825 23.3742 12.0095 24.1308 11.941 25.1099C11.8727 26.0869 12.6315 26.9625 13.6097 27.0295Z"
      fill={fill}
    />
  </svg>
);