export const ArrowDown = ({
  fill = "#5158F6",
}: {
  fill?: string;
  props?: unknown;
}) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.9011 4.05676C20.239 3.80696 19.4865 3.76696 18.7873 3.83547C17.9438 3.91817 17.1268 4.11582 16.3285 4.39668C14.637 4.99176 13.0369 5.85082 11.5356 6.82488C10.2243 7.67567 8.95606 8.63055 7.84583 9.73442C6.38852 11.1834 5.36055 13.0029 4.70063 14.9384C4.05704 16.8259 3.79938 18.8621 3.8295 20.8515C3.85735 22.692 4.11622 24.5686 4.73563 26.3071C5.82399 29.3618 7.90114 31.9033 10.5828 33.7061C13.1984 35.4644 16.3085 36.4105 19.4338 36.6639C22.6256 36.9227 25.8595 36.3509 28.774 35.0323C30.2341 34.3718 31.6896 33.5051 32.7582 32.2944C33.9822 30.9077 34.7832 29.2049 35.314 27.4452C35.8461 25.6813 36.0998 23.817 36.1471 21.9777C36.1903 20.295 36.0469 18.5753 35.589 16.9516C35.0881 15.1752 34.2669 13.4677 33.2507 11.93C32.1626 10.2834 30.8375 8.82235 29.2512 7.64543C27.9111 6.65121 26.3639 5.98 24.7085 5.76063C24.8054 5.77363 24.9023 5.78668 24.9992 5.79969C23.7999 5.63785 22.6107 5.40004 21.4138 5.22133C20.7192 5.11762 20.0206 5.01375 19.3193 4.9666C19.1244 4.95352 18.9264 4.94363 18.7316 4.96305C18.2352 5.01254 17.8654 5.15582 17.5655 5.58285C17.4521 5.74442 17.4175 5.97696 17.4071 6.16625C17.3743 6.76207 17.9294 7.26 18.5008 7.26C19.1218 7.26 19.5618 6.76133 19.5946 6.16625C19.5947 6.16403 19.5948 6.1618 19.5949 6.15957C19.5819 6.25649 19.5689 6.3534 19.5559 6.45035C19.5379 6.5561 19.3856 6.78801 19.292 6.89723C19.3579 6.8202 18.9831 7.10309 19.1129 7.03977C18.7247 7.2291 18.8515 7.13531 18.9895 7.11547C18.8926 7.12848 18.7957 7.14153 18.6987 7.15453C19.2885 7.0791 19.9283 7.20465 20.5114 7.28278C20.4145 7.26977 20.3175 7.25672 20.2206 7.24371C21.7608 7.45188 23.2855 7.7884 24.8296 7.96317C24.7327 7.95016 24.6358 7.93711 24.5389 7.9241C24.9427 7.98977 25.3389 8.08863 25.7274 8.21672C25.9159 8.27887 26.1014 8.34969 26.2849 8.4252C25.9081 8.2702 26.2582 8.4161 26.3443 8.45559C26.4512 8.50461 26.5567 8.5566 26.6616 8.60969C27.0429 8.80258 27.4094 9.02399 27.7635 9.26274C27.937 9.37973 28.1064 9.5027 28.2734 9.62883C28.4383 9.75344 28.0559 9.45914 28.219 9.5868C28.2606 9.61942 28.3019 9.65258 28.3432 9.68574C28.4399 9.76348 28.535 9.84324 28.6295 9.92375C29.3196 10.5117 29.946 11.1729 30.5188 11.8748C30.5886 11.9603 30.6571 12.0469 30.7252 12.1337C30.8565 12.3011 30.56 11.9182 30.6891 12.0873C30.7227 12.1313 30.7559 12.1755 30.789 12.2198C30.9327 12.4117 31.0715 12.6072 31.2074 12.8048C31.4679 13.1836 31.7121 13.5736 31.9433 13.9709C32.1986 14.4099 32.4339 14.8604 32.6516 15.3192C32.7052 15.4321 32.757 15.5458 32.8082 15.6599C32.8482 15.7491 33.0237 16.1633 32.8665 15.7886C32.9676 16.0296 33.062 16.2735 33.1515 16.5191C33.4692 17.3909 33.7099 18.2939 33.8367 19.2137C33.8236 19.1168 33.8106 19.0199 33.7976 18.923C34.0346 20.7008 34.0142 22.5072 33.7768 24.2841C33.7898 24.1871 33.8028 24.0902 33.8158 23.9933C33.6955 24.8763 33.52 25.7509 33.2789 26.609C33.16 27.0318 33.0228 27.4495 32.8691 27.8609C32.8326 27.9585 32.7947 28.0554 32.7561 28.1522C32.7368 28.2004 32.7171 28.2483 32.6973 28.2962C32.619 28.4865 32.8082 28.0366 32.7271 28.2254C32.6395 28.4294 32.5455 28.6306 32.4473 28.8297C32.2624 29.2046 32.0557 29.5685 31.8295 29.9199C31.7232 30.085 31.6109 30.2461 31.4948 30.4042C31.466 30.4434 31.4366 30.4821 31.4072 30.5209C31.6259 30.2329 31.5086 30.3896 31.4588 30.4522C31.3889 30.5402 31.3165 30.6262 31.2431 30.7114C30.9846 31.0112 30.7019 31.2898 30.3999 31.5456C30.3276 31.6068 30.0414 31.8287 30.3643 31.5805C30.2899 31.6378 30.2136 31.6926 30.1368 31.7467C29.9734 31.8616 29.8055 31.9708 29.6371 32.0784C29.1364 32.3986 28.616 32.6876 28.0824 32.9491C27.946 33.0161 27.8083 33.0804 27.67 33.1435C27.6009 33.175 27.5315 33.2057 27.4619 33.2362C27.3772 33.2734 27.0959 33.3911 27.4719 33.2334C27.192 33.3508 26.9083 33.4593 26.6224 33.5612C25.4791 33.9688 24.2913 34.2479 23.0891 34.411C23.186 34.398 23.2829 34.385 23.3798 34.372C21.7423 34.59 20.0802 34.5879 18.4428 34.3706C18.5397 34.3836 18.6366 34.3966 18.7336 34.4097C17.2479 34.2088 15.7888 33.8315 14.3972 33.2727C14.3069 33.2364 13.9831 33.0998 14.3704 33.2637C14.2884 33.229 14.2069 33.1934 14.1255 33.1575C13.9495 33.0797 13.7751 32.9982 13.6018 32.9144C13.2698 32.7537 12.9438 32.5807 12.6234 32.3978C12.3044 32.2157 11.9924 32.0213 11.687 31.8172C11.5407 31.7195 11.3966 31.6187 11.2538 31.516C11.1825 31.4646 11.1119 31.4124 11.0415 31.3599C11.0063 31.3336 10.9713 31.307 10.9364 31.2805C10.795 31.173 11.186 31.4753 10.9842 31.3171C10.4089 30.8661 9.8693 30.3698 9.36981 29.8361C9.11938 29.5685 8.88094 29.2898 8.6529 29.003C8.62548 28.9684 8.59837 28.9337 8.57126 28.8989C8.80005 29.1926 8.68465 29.0457 8.63493 28.9801C8.58153 28.9096 8.52919 28.8384 8.47719 28.767C8.36419 28.6116 8.25536 28.4533 8.14923 28.2932C7.73481 27.6682 7.37731 27.0061 7.07512 26.32C7.05669 26.2781 7.03868 26.2361 7.02067 26.194C7.16821 26.5386 7.09176 26.3627 7.0602 26.286C7.02512 26.2008 6.99137 26.1152 6.95809 26.0293C6.88536 25.8417 6.81786 25.6521 6.7536 25.4615C6.62774 25.0879 6.5202 24.7083 6.427 24.3253C6.30442 23.8218 6.21805 23.3106 6.14786 22.7974C6.16087 22.8943 6.17391 22.9913 6.18692 23.0882C5.96731 21.4466 5.95423 19.7793 6.17442 18.137C6.16141 18.2339 6.14837 18.3309 6.13536 18.4278C6.26606 17.4775 6.47516 16.54 6.77391 15.6282C6.84497 15.4113 6.92251 15.1966 7.00399 14.9835C7.04465 14.8771 7.08731 14.7716 7.13059 14.6663C7.21344 14.4649 7.02286 14.918 7.10907 14.7182C7.13907 14.6486 7.17012 14.5795 7.2013 14.5105C7.39583 14.08 7.61645 13.6616 7.85813 13.2557C7.97407 13.0611 8.09684 12.8706 8.22372 12.683C8.28719 12.5891 8.35278 12.4965 8.41903 12.4045C8.45216 12.3585 8.48598 12.3129 8.51981 12.2674C8.69258 12.0348 8.40473 12.4127 8.52149 12.2634C8.81501 11.8882 9.13508 11.5343 9.47454 11.2004C9.97235 10.7106 10.5061 10.2534 11.0565 9.82395C11.1413 9.75805 11.1017 9.7886 10.9377 9.91551C10.9725 9.88871 11.0074 9.86211 11.0423 9.83551C11.1135 9.78121 11.1852 9.72754 11.2571 9.67406C11.406 9.56324 11.5565 9.45445 11.7077 9.34688C12.0275 9.11945 12.3529 8.89992 12.6821 8.68633C13.364 8.24383 14.0661 7.83188 14.7858 7.45403C15.1397 7.26828 15.4988 7.09274 15.8625 6.92703C15.9561 6.88442 16.0501 6.84289 16.1443 6.8018C16.1912 6.78141 16.2382 6.76137 16.2851 6.74137C15.951 6.88363 16.1376 6.80379 16.2113 6.7734C16.3964 6.69715 16.5832 6.62512 16.7711 6.5561C17.4498 6.3066 18.1515 6.10699 18.869 6.0086C18.7721 6.0216 18.6752 6.03465 18.5782 6.04766C19.0243 5.9893 19.4753 5.97203 19.9221 6.03188C19.8252 6.01887 19.7283 6.00582 19.6314 5.99281C19.8668 6.02676 20.097 6.08211 20.3197 6.16617C20.8782 6.37688 21.5181 5.93707 21.6652 5.40223C21.8342 4.78723 21.4584 4.26703 20.9011 4.05676Z"
      fill={fill}
    />
    <path
      d="M25.3889 17.7883C25.1675 18.1038 24.9401 18.4148 24.7071 18.7217C24.6805 18.7567 24.6539 18.7915 24.6271 18.8263C24.7311 18.6921 24.7476 18.6706 24.6768 18.7618C24.6087 18.8495 24.5398 18.9366 24.4707 19.0235C24.345 19.1819 24.2171 19.3385 24.0882 19.4944C23.5609 20.1316 23.0059 20.7459 22.4267 21.3363C21.8477 21.9265 21.2397 22.4887 20.6033 23.0167C20.4475 23.1459 20.2892 23.2721 20.1296 23.3965C20.3941 23.1903 20.1409 23.3864 20.0855 23.428C19.9973 23.4943 19.9081 23.5593 19.8187 23.624C19.6598 23.7388 19.4982 23.8501 19.3353 23.9592C19.0093 24.1775 18.7936 24.4997 18.7936 24.9036C18.7936 24.9817 18.7936 25.0599 18.7936 25.138C19.4159 24.8802 20.0383 24.6224 20.6607 24.3646C19.4991 23.0181 18.3916 21.626 17.2326 20.2773C16.1193 18.9818 14.9571 17.7092 13.6287 16.6294C13.3941 16.4387 13.169 16.3091 12.8553 16.3091C12.5664 16.3091 12.2861 16.4253 12.0819 16.6294C11.693 17.0184 11.6186 17.7997 12.0819 18.1762C13.4107 19.2563 14.571 20.5294 15.6858 21.8241C16.8462 23.1717 17.9523 24.5649 19.1139 25.9114C19.3634 26.2006 19.8232 26.2903 20.178 26.1927C20.6472 26.0637 20.981 25.6244 20.981 25.138C20.981 25.0599 20.981 24.9817 20.981 24.9036C20.8004 25.2185 20.6199 25.5332 20.4393 25.848C23.1525 24.0311 25.4105 21.5534 27.2777 18.8925C27.6207 18.4036 27.3675 17.6785 26.8853 17.396C26.3387 17.0758 25.7306 17.3013 25.3889 17.7883Z"
      fill={fill}
    />
  </svg>
);
