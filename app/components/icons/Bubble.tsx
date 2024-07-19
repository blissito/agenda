export const Bubble = ({
  fill = "#5158F6",
  className,
}: {
  fill?: string;
  className?: string;
}) => (
  <svg
    className={className}
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.92969 24.2198C10.5132 24.4541 11.486 23.8325 12.1625 23.3638C12.6962 21.9222 13.2479 20.4295 13.7815 18.988C13.5343 18.8558 13.3451 18.7196 13.0978 18.5874C12.1015 20.4255 10.926 22.3817 9.92969 24.2198ZM34.6995 5.68311C35.0691 6.09857 35.312 6.39796 35.6572 6.70827C35.6152 9.61102 35.5697 15.2602 35.5277 18.163C35.2349 18.5264 34.9395 18.7223 34.5605 18.9332C34.6274 15.2934 34.6326 9.32289 34.6995 5.68311ZM54.4979 40.1735C53.9235 40.4293 52.9283 39.8441 52.2349 39.4009C51.6482 37.9801 51.0415 36.5089 50.4547 35.0881C50.6969 34.9468 50.8809 34.8037 51.1231 34.6625C52.1869 36.4623 53.4341 38.3736 54.4979 40.1735ZM29.0577 22.5681C28.7038 22.997 28.4722 23.3052 28.1387 23.6281C28.2883 26.5273 28.5433 32.1709 28.6929 35.0701C28.999 35.4225 29.3015 35.6072 29.688 35.8039C29.4861 32.1691 29.2596 26.2029 29.0577 22.5681ZM10.9121 58.3882C11.4999 58.6118 12.461 57.9722 13.1287 57.4911C13.6356 56.0399 14.1596 54.5372 14.6664 53.086C14.4168 52.9585 14.2251 52.8258 13.9754 52.6982C13.0133 54.5544 11.8743 56.5321 10.9121 58.3882ZM35.3345 39.3961C35.7117 39.8047 35.9601 40.0995 36.311 40.4034C36.3227 43.3064 36.3818 48.9555 36.3936 51.8585C36.1076 52.2273 35.8158 52.4286 35.4409 52.6465C35.4404 49.0061 35.335 43.0365 35.3345 39.3961Z"
      fill={fill}
    />
    <path
      d="M10.0488 24.179C9.8485 24.179 9.65672 24.087 9.53086 23.9264C8.92984 23.1572 8.43069 22.3323 7.94867 21.5348C7.45295 20.715 6.98206 19.9363 6.45809 19.3194L4.28943 19.3327C3.94011 19.3301 3.66785 19.0836 3.63018 18.7492C3.26717 15.545 3.23891 10.4881 3.33309 6.82414C3.34165 6.48681 3.6045 6.21069 3.94097 6.18501C13.506 5.46027 25.0172 5.5416 34.2637 5.60667C34.4435 5.60795 34.6139 5.68201 34.7372 5.81215C34.8605 5.94229 34.9247 6.11694 34.9161 6.29588C34.8031 8.63578 34.8476 12.1225 34.8836 14.9243C34.899 16.155 34.9136 17.2877 34.9144 18.1987C34.9144 18.5305 34.6679 18.8104 34.3382 18.8515C29.9504 19.399 24.9187 19.3096 20.0506 19.2235C17.6841 19.182 15.4401 19.1418 13.3716 19.1777C12.3228 20.4675 11.2295 22.31 10.661 23.7612C10.5754 23.9812 10.3776 24.1379 10.1439 24.1722C10.1122 24.1769 10.0805 24.179 10.0488 24.179ZM6.75176 18.0026C6.93412 18.0026 7.10792 18.0784 7.23292 18.212C7.92641 18.9564 8.48378 19.8785 9.07453 20.8545C9.34508 21.3019 9.62076 21.7578 9.91357 22.2013C10.6105 20.7681 11.6002 19.2227 12.5591 18.0994C12.6807 17.9564 12.8579 17.8729 13.0454 17.8687C15.2218 17.8229 17.5797 17.8652 20.0737 17.9085C24.6807 17.9898 29.4375 18.0737 33.5976 17.6144C33.5925 16.8263 33.5814 15.9145 33.5685 14.941C33.5343 12.2488 33.4958 9.23081 33.5745 6.91703C24.6644 6.85453 13.7929 6.79545 4.6336 7.45256C4.5634 10.7818 4.59593 15.0472 4.8759 18.0142L6.74576 18.0026H6.75176Z"
      fill={fill}
    />
    <path
      d="M9.60045 14.254C9.52597 14.254 9.45148 14.2467 9.37785 14.2322C9.07477 14.1718 8.81107 13.9925 8.65439 13.7399C8.49857 13.4877 8.4549 13.1723 8.53624 12.8743C8.61672 12.5759 8.81364 12.3255 9.07648 12.1868C9.1561 12.1449 9.24001 12.1209 9.32306 12.1132C9.71689 11.995 10.1604 12.1256 10.4369 12.4574C10.6261 12.6851 10.7135 12.9916 10.6741 13.2981C10.6347 13.6046 10.4746 13.8803 10.2332 14.0541C10.0508 14.1851 9.82819 14.254 9.60045 14.254ZM19.0439 14.1812C18.9035 14.1812 18.7606 14.1564 18.6219 14.1072C18.2888 13.9882 18.032 13.739 17.9164 13.424C17.7871 13.0712 17.8522 12.6723 18.0893 12.3568C18.1484 12.2788 18.2143 12.2099 18.2871 12.1513C18.4087 11.9569 18.5953 11.8092 18.8154 11.7437C19.3102 11.5943 19.8522 11.8495 20.1056 12.3422C20.4095 12.9381 20.1989 13.6907 19.6364 14.0216C19.4566 14.1273 19.2529 14.1812 19.0439 14.1812ZM28.377 13.7938C28.3059 13.7938 28.2349 13.7866 28.1647 13.7716C27.871 13.7086 27.6107 13.5173 27.4515 13.2463C27.2888 12.9702 27.2477 12.6423 27.3385 12.3469C27.5106 11.7784 28.1313 11.4248 28.7186 11.5601C28.9677 11.617 29.151 11.8088 29.2092 12.0408C29.371 12.2215 29.466 12.4501 29.4737 12.6911C29.484 13.01 29.3427 13.3178 29.085 13.5336C28.883 13.7026 28.6296 13.7938 28.377 13.7938ZM54.353 40.1376C54.3299 40.1376 54.3059 40.1363 54.282 40.1337C54.0474 40.108 53.8445 39.9586 53.7503 39.742C53.1287 38.3135 51.9686 36.513 50.8719 35.2626C48.8017 35.3037 46.5611 35.4265 44.1963 35.5558C39.3368 35.8221 34.3102 36.0982 29.9078 35.7142C29.5773 35.6855 29.3205 35.415 29.3085 35.0836C29.2743 34.1667 29.2469 33.025 29.216 31.7844C29.145 28.8461 29.0636 25.5156 28.8642 23.1885C28.8487 23.01 28.907 22.8332 29.0251 22.6988C29.1433 22.5639 29.3111 22.4835 29.49 22.4753C38.7332 22.0674 50.2349 21.5584 59.8145 21.9295C60.151 21.9428 60.4241 22.2086 60.4446 22.5455C60.6749 26.2031 60.8342 31.2574 60.591 34.4728C60.5653 34.8084 60.2905 35.0708 59.954 35.0802L57.7862 35.1479C57.2845 35.7836 56.8427 36.5798 56.3778 37.4171C55.9258 38.2322 55.4583 39.0746 54.8856 39.8657C54.7614 40.0374 54.5628 40.1376 54.353 40.1376ZM51.1604 33.9424C51.3445 33.9424 51.52 34.0194 51.6441 34.1547C52.645 35.2425 53.6903 36.7497 54.4395 38.1556C54.716 37.7018 54.9746 37.236 55.228 36.7793C55.782 35.7814 56.3051 34.8392 56.9712 34.0695C57.0919 33.93 57.2657 33.8478 57.4506 33.8426L59.3188 33.7844C59.4883 30.8092 59.3624 26.546 59.1689 23.2219C50.002 22.9051 39.1338 23.367 30.228 23.7592C30.3924 26.0618 30.4652 29.0695 30.5311 31.7523C30.5551 32.7352 30.5773 33.6556 30.6022 34.4505C34.776 34.7557 39.5234 34.4946 44.1244 34.2429C46.6167 34.1063 48.9712 33.9775 51.1501 33.9424C51.1535 33.9424 51.157 33.9424 51.1604 33.9424Z"
      fill={fill}
    />
    <path
      d="M54.4168 30.2029C54.2027 30.2029 53.9938 30.1425 53.8192 30.0261C53.57 29.8609 53.3988 29.5912 53.3491 29.286C53.2986 28.9812 53.374 28.6717 53.5555 28.4366C53.8174 28.0963 54.2567 27.9495 54.6548 28.0526C54.7387 28.0574 54.8234 28.0779 54.9039 28.1164C55.171 28.2453 55.3782 28.4884 55.4698 28.7834C55.5623 29.0779 55.5306 29.3951 55.3834 29.6532C55.237 29.9114 54.9801 30.1006 54.6805 30.1721C54.5931 30.1926 54.5041 30.2029 54.4168 30.2029ZM44.9733 30.4803C44.7806 30.4803 44.5906 30.4341 44.4193 30.342C43.8448 30.0312 43.6068 29.2872 43.8885 28.6832C44.1231 28.1785 44.6591 27.908 45.1556 28.0351C45.3782 28.0925 45.57 28.2329 45.6984 28.4221C45.7738 28.4786 45.8431 28.5454 45.9048 28.6216C46.1539 28.9285 46.2327 29.3249 46.1162 29.6815C46.0135 29.9991 45.7661 30.2581 45.4382 30.3895C45.2866 30.4503 45.1291 30.4803 44.9733 30.4803ZM35.6377 30.4392C35.3988 30.4392 35.1582 30.3579 34.9613 30.2055C34.6959 30 34.5426 29.6982 34.5401 29.3771C34.5383 29.1357 34.6257 28.9028 34.7815 28.7162C34.8311 28.4833 35.0067 28.286 35.2524 28.2192C35.8337 28.0629 36.4647 28.3908 36.6616 28.9529C36.7635 29.2466 36.7335 29.5758 36.582 29.8574C36.433 30.1336 36.1796 30.3343 35.8885 30.4084C35.8063 30.4289 35.7224 30.4392 35.6377 30.4392ZM11.0186 58.345C10.8226 58.345 10.6342 58.2573 10.5084 58.1023C9.89194 57.3433 9.37738 56.527 8.87995 55.7371C8.36967 54.9281 7.88509 54.1592 7.35084 53.5531L5.18132 53.6062C4.84313 53.6199 4.55546 53.3686 4.5118 53.0351C4.08971 49.8339 3.96813 44.78 3.99468 41.1177C3.99724 40.7804 4.25409 40.4996 4.59057 40.4679C14.1334 39.5659 25.6462 39.4336 34.8971 39.3275C35.0606 39.3176 35.249 39.3964 35.374 39.5244C35.4998 39.652 35.5674 39.8258 35.5623 40.0047C35.493 42.3403 35.5966 45.6712 35.689 48.6096C35.7276 49.8489 35.7635 50.9893 35.7806 51.9058C35.7866 52.2376 35.5452 52.5218 35.2164 52.5689C30.8414 53.1969 25.8097 53.2012 20.9433 53.205C18.5734 53.2072 16.3294 53.2093 14.2592 53.2834C13.2353 54.5912 12.177 56.4533 11.6351 57.9157C11.5529 58.1374 11.3585 58.2975 11.1257 58.336C11.0897 58.342 11.0546 58.345 11.0186 58.345ZM7.63166 52.2307C7.80974 52.2307 7.98012 52.3031 8.10426 52.4311C8.81144 53.1618 9.38509 54.0723 9.99211 55.0359C10.2712 55.4794 10.5563 55.9315 10.8585 56.3703C11.5289 54.9238 12.4887 53.3604 13.427 52.22C13.546 52.0753 13.7216 51.9884 13.9091 51.9807C16.0863 51.8943 18.445 51.8921 20.9424 51.89C25.5478 51.8861 30.3038 51.8823 34.4527 51.3459C34.4339 50.5518 34.4048 49.6323 34.374 48.6511C34.2901 45.9675 34.1959 42.9593 34.2318 40.6502C25.32 40.753 14.445 40.896 5.30632 41.7222C5.29776 45.0496 5.40906 49.3129 5.74382 52.277L7.61368 52.2312C7.61967 52.2307 7.62567 52.2307 7.63166 52.2307Z"
      fill={fill}
    />
    <path
      d="M10.3767 48.4307C10.3091 48.4307 10.2415 48.4247 10.1747 48.4128C9.87074 48.358 9.60448 48.1837 9.44266 47.9342C9.28085 47.6829 9.2329 47.3678 9.30824 47.069C9.38444 46.7698 9.57708 46.5159 9.83735 46.3725C9.91526 46.3297 9.99831 46.304 10.0822 46.295C10.4726 46.1696 10.9221 46.292 11.2021 46.62C11.3947 46.8421 11.4872 47.1474 11.4538 47.4543C11.4213 47.7612 11.2654 48.0399 11.0283 48.218C10.8416 48.3571 10.6122 48.4307 10.3767 48.4307ZM19.8159 48.1829C19.6815 48.1829 19.5463 48.1606 19.4136 48.1161C19.0788 48.0031 18.8177 47.7582 18.6969 47.4453C18.5617 47.0956 18.619 46.6957 18.8511 46.3755C18.9076 46.2972 18.9726 46.2274 19.0437 46.1675C19.1618 45.9706 19.3459 45.819 19.5651 45.7497C20.0488 45.5956 20.6096 45.8434 20.8673 46.3267C21.1815 46.914 20.9846 47.67 20.429 48.0116C20.244 48.1251 20.0326 48.1829 19.8159 48.1829ZM19.8142 46.867C19.7894 46.867 19.7612 46.8781 19.7406 46.8909C19.744 47.0069 19.8459 47.0279 19.935 47.0104C19.9324 46.9971 19.9281 46.9838 19.923 46.971C19.9016 46.9149 19.8622 46.8794 19.8348 46.87C19.8279 46.8678 19.8211 46.867 19.8142 46.867Z"
      fill={fill}
    />
    <path
      d="M29.1442 47.6224C29.08 47.6224 29.0149 47.6164 28.9515 47.6039C28.6562 47.5466 28.3933 47.3604 28.2289 47.0932C28.0611 46.8206 28.0132 46.4935 28.0971 46.1964C28.2598 45.6232 28.877 45.2602 29.4627 45.3826C29.7127 45.4353 29.8993 45.6228 29.9618 45.8531C30.127 46.0307 30.2272 46.2576 30.2392 46.4982C30.2555 46.8188 30.1193 47.1288 29.8659 47.3492C29.6621 47.526 29.4027 47.6224 29.1442 47.6224Z"
      fill={fill}
    />
    <path
      d="M40.8186 15.7447C40.7313 15.7447 40.6431 15.7276 40.5583 15.6912C40.2253 15.5473 40.0712 15.1608 40.215 14.8273C40.7861 13.5007 41.5121 12.2396 42.3726 11.079C42.5892 10.7875 43.0018 10.7259 43.2921 10.9425C43.584 11.1591 43.6457 11.5709 43.4291 11.8624C42.6285 12.9416 41.9539 14.1141 41.4222 15.347C41.3152 15.5961 41.0729 15.7447 40.8186 15.7447Z"
      fill={fill}
    />
    <path
      d="M43.2531 17.6328C43.0758 17.6328 42.8986 17.5613 42.7693 17.4205C42.5236 17.1534 42.5407 16.7377 42.8078 16.4916L45.432 14.0742C45.6983 13.8289 46.1161 13.846 46.3609 14.1127C46.6066 14.3798 46.5895 14.7955 46.3224 15.0416L43.6983 17.459C43.5724 17.5755 43.4123 17.6328 43.2531 17.6328Z"
      fill={fill}
    />
    <path
      d="M44.8725 19.4704C44.5351 19.4704 44.2483 19.2123 44.2184 18.8698C44.1867 18.5081 44.4547 18.1892 44.816 18.1579L47.3374 17.9388C47.6961 17.9058 48.018 18.1755 48.0488 18.5372C48.0805 18.899 47.8125 19.2174 47.4504 19.2487L44.9307 19.4679C44.911 19.4696 44.8913 19.4704 44.8725 19.4704Z"
      fill={fill}
    />
    <path
      d="M4.28943 19.3327L6.45809 19.3194C7.39143 20.4182 8.40804 22.4893 9.53086 23.9264C9.63794 24.0631 9.79612 24.1364 9.96328 24.1593C9.95247 24.1792 9.94059 24.1998 9.92984 24.2196C10.5134 24.4539 11.4862 23.8323 12.1627 23.3636C12.6735 21.9836 13.2002 20.5587 13.7125 19.1747C20.0764 19.0894 27.9225 19.6521 34.3382 18.8515C34.4192 18.8414 34.4947 18.8163 34.5633 18.7802C34.5624 18.83 34.5616 18.8839 34.5607 18.933C34.9396 18.7221 35.2351 18.5262 35.5279 18.1627C35.5699 15.26 35.6154 9.61079 35.6574 6.70807C35.3122 6.39777 35.0692 6.09838 34.6996 5.68292C34.699 5.71556 34.6985 5.75163 34.6979 5.78465C34.5784 5.67581 34.4272 5.60785 34.2637 5.60667C25.0172 5.5416 13.506 5.46027 3.94097 6.18501C3.60449 6.21069 3.34165 6.48681 3.33309 6.82414C3.23891 10.4881 3.26717 15.545 3.63018 18.7492C3.66785 19.0836 3.94011 19.3301 4.28943 19.3327ZM4.63361 7.45256C13.7929 6.79545 24.6644 6.85453 33.5745 6.91703C33.4673 10.0667 33.5776 14.5318 33.5976 17.6144C27.1678 18.3243 19.2847 17.7373 13.0454 17.8687C12.8579 17.8729 12.6807 17.9564 12.5591 18.0994C11.6002 19.2227 10.6105 20.7681 9.91357 22.2013C9.62076 21.7578 9.34508 21.3019 9.07453 20.8545C8.48378 19.8785 7.92641 18.9564 7.23292 18.212C7.10792 18.0784 6.93412 18.0026 6.75176 18.0026C6.66348 18.0026 4.78762 18.0141 4.8759 18.0142C4.59593 15.0472 4.5634 10.7818 4.63361 7.45256Z"
      fill={fill}
    />
    <path
      d="M9.59984 14.2541C10.1656 14.2541 10.6033 13.8447 10.6735 13.2982C10.7758 12.5016 10.0403 11.8979 9.32245 12.1133C8.7148 12.1697 8.2334 13.0598 8.65378 13.74C8.81046 13.9926 9.21098 14.2541 9.59984 14.2541ZM19.0433 14.1814C19.9675 14.1814 20.5205 13.157 20.105 12.3423C19.712 11.5782 18.708 11.4776 18.2865 12.1514C17.4332 12.8391 17.9074 14.1814 19.0433 14.1814ZM28.3764 13.794C28.9709 13.794 29.4926 13.2962 29.4731 12.6912C29.4654 12.4502 29.3704 12.2216 29.2086 12.041C29.0012 11.2145 27.6139 11.4352 27.3379 12.347C27.1246 13.041 27.6525 13.794 28.3764 13.794ZM59.8139 21.9297C50.2343 21.5585 38.7325 22.0675 29.4894 22.4755C29.3269 22.4829 29.1783 22.5564 29.063 22.6697C29.0612 22.6367 29.0593 22.6007 29.0575 22.5681C28.7036 22.997 28.472 23.3053 28.1385 23.6281C28.2881 26.5273 28.5431 32.1709 28.6927 35.0701C28.9988 35.4225 29.3013 35.6073 29.6878 35.804C29.685 35.755 29.6823 35.7011 29.6795 35.6513C29.7494 35.6849 29.8259 35.7073 29.9072 35.7143C34.3096 36.0983 39.3361 35.8222 44.1957 35.5559C46.4333 35.4336 48.5545 35.3194 50.5305 35.2724C51.0938 36.6365 51.673 38.0408 52.2347 39.4009C52.9281 39.8442 53.9233 40.4293 54.4977 40.1735C54.4858 40.1532 54.4725 40.1321 54.4604 40.1118C54.6272 40.0829 54.7833 40.0065 54.8849 39.8659C55.9275 38.4259 56.8685 36.3101 57.7856 35.148L59.9534 35.0803C60.2899 35.0709 60.5647 34.8085 60.5904 34.4729C60.8336 31.2576 60.6743 26.2032 60.444 22.5457C60.4235 22.2088 60.1504 21.9429 59.8139 21.9297ZM59.3182 33.7845L57.45 33.8428C57.2651 33.8479 57.0913 33.9301 56.9706 34.0696C55.984 35.2097 55.3153 36.7176 54.4389 38.1557C53.6897 36.7499 52.6444 35.2426 51.6435 34.1548C51.5194 34.0196 51.3438 33.9425 51.1598 33.9425C51.1563 33.9425 51.1529 33.9425 51.1495 33.9425C48.9706 33.9776 46.6161 34.1065 44.1238 34.243C39.5228 34.4947 34.7754 34.7559 30.6016 34.4506C30.5767 33.6557 30.5545 32.7353 30.5305 31.7524C30.4646 29.0696 30.3918 26.0619 30.2274 23.7593C39.1332 23.3672 50.0014 22.9053 59.1683 23.222C59.3618 26.5461 59.4877 30.8094 59.3182 33.7845Z"
      fill={fill}
    />
    <path
      d="M53.5555 28.437C53.034 29.1121 53.4738 30.2032 54.4168 30.2032C55.1555 30.2032 55.7002 29.5174 55.4698 28.7837C55.1925 27.8908 54.0579 27.7843 53.5555 28.437ZM45.6984 28.4224C45.2485 27.7594 44.2464 27.9135 43.8885 28.6835C43.6068 29.2876 43.8448 30.0316 44.4193 30.3424C45.5105 30.9289 46.7263 29.634 45.9048 28.6219C45.8431 28.5457 45.7738 28.4789 45.6984 28.4224ZM34.7815 28.7165C34.1985 29.4148 34.7442 30.4395 35.6377 30.4395C36.3826 30.4395 36.9045 29.6532 36.6616 28.9532C36.3357 28.0229 34.9525 27.9147 34.7815 28.7165ZM4.59057 40.4682C4.25409 40.4999 3.99724 40.7807 3.99468 41.118C3.96813 44.7803 4.08971 49.8342 4.5118 53.0354C4.55546 53.3689 4.84313 53.6202 5.18132 53.6065L7.35084 53.5534C8.30557 54.6367 9.3614 56.6904 10.5084 58.1026C10.6175 58.237 10.7764 58.3086 10.9438 58.3285C10.9336 58.3482 10.9222 58.3686 10.9121 58.3883C11.4998 58.6118 12.4609 57.9722 13.1287 57.4911C13.6138 56.102 14.1141 54.6676 14.6006 53.2744C21.0161 53.0703 28.8186 53.4876 35.2164 52.5692C35.2973 52.5576 35.3726 52.5311 35.4405 52.4936C35.4406 52.5436 35.4408 52.5974 35.4408 52.6466C35.8157 52.4287 36.1075 52.2274 36.3935 51.8586C36.3818 48.9555 36.3227 43.3064 36.3109 40.4034C35.96 40.0995 35.7116 39.8047 35.3344 39.3961C35.3344 39.4289 35.3345 39.4651 35.3345 39.4983C35.211 39.3897 35.0462 39.3188 34.8971 39.3278C25.6462 39.434 14.1334 39.5662 4.59057 40.4682ZM13.9091 51.9811C13.7216 51.9888 13.546 52.0757 13.427 52.2203C12.4887 53.3608 11.5289 54.9241 10.8585 56.3706C9.89705 54.9747 9.14621 53.508 8.10426 52.4314C7.98012 52.3034 7.80974 52.2311 7.63166 52.2311C7.54338 52.2311 5.65554 52.2767 5.74382 52.2773C5.40906 49.3132 5.29776 45.05 5.30632 41.7225C14.445 40.8963 25.32 40.7533 34.2318 40.6506C34.1959 42.9596 34.2901 45.9678 34.374 48.6514C34.4048 49.6326 34.4339 50.5521 34.4527 51.3462C28.0401 52.1752 20.142 51.7335 13.9091 51.9811Z"
      fill={fill}
    />
    <path
      d="M10.0826 46.2952C9.99869 46.3042 9.91564 46.3299 9.83773 46.3727C8.98992 46.8398 9.09949 48.219 10.1751 48.4129C11.2295 48.6022 11.8477 47.3643 11.2025 46.6201C10.9225 46.2922 10.473 46.1698 10.0826 46.2952ZM19.0441 46.1676C18.1932 46.8852 18.7169 48.183 19.8163 48.183C20.0329 48.183 20.2444 48.1253 20.4293 48.0118C20.985 47.6702 21.1819 46.9142 20.8677 46.3269C20.4784 45.5969 19.4648 45.4665 19.0441 46.1676ZM28.0971 46.1967C27.9229 46.8139 28.327 47.483 28.9516 47.6043C29.6143 47.7341 30.2741 47.1846 30.2393 46.4985C30.2273 46.258 30.1271 46.0311 29.9619 45.8534C29.739 45.0323 28.3569 45.2815 28.0971 46.1967ZM40.8189 15.7447C41.6733 15.7447 41.2722 14.7705 43.4293 11.8624C43.646 11.5709 43.5843 11.1591 43.2924 10.9425C43.0021 10.7259 42.5894 10.7875 42.3728 11.079C41.5124 12.2396 40.7864 13.5007 40.2153 14.8273C40.0283 15.2608 40.3471 15.7447 40.8189 15.7447ZM43.253 17.633C43.7089 17.633 43.6536 17.4181 46.3223 15.0418C46.5894 14.7956 46.6066 14.38 46.3608 14.1128C46.116 13.8461 45.6982 13.829 45.4319 14.0743L42.8078 16.4917C42.368 16.8969 42.6575 17.633 43.253 17.633ZM44.2187 18.8701C44.2487 19.2126 44.5355 19.4707 44.8728 19.4707C44.9176 19.4707 47.4061 19.2528 47.4507 19.249C47.8129 19.2177 48.0809 18.8992 48.0492 18.5375C48.0184 18.1758 47.6965 17.9061 47.3377 17.939L44.8163 18.1582C44.455 18.1895 44.187 18.5084 44.2187 18.8701Z"
      fill={fill}
    />
  </svg>
);